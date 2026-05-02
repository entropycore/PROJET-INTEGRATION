'use strict';

const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');

//  Fonction pour éviter de répéter le code du Role ID
const getRoleId = (user) => {
  const roles = {
    STUDENT: user.student?.id,
    PROFESSIONAL: user.professional?.id,
    PROFESSOR: user.professor?.id,
    ADMINISTRATOR: user.administrator?.id
  };
  return roles[user.role] || null;
};

//  Inscription Professionnel
exports.registerProfessional = async (userData) => {
  const { email, password, lastName, firstName, company, jobTitle } = userData;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error("EMAIL_ALREADY_EXISTS");

  const hashedPassword = await bcrypt.hash(password, 10);
  const emailToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(emailToken).digest('hex');
  const tokenExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const newUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email, lastName, firstName, passwordHash: hashedPassword,
        role: 'PROFESSIONAL', accountStatus: 'PENDING'
      }
    });

    await tx.professional.create({
      data: {
        userId: user.id, company, jobTitle,
        isEmailVerified: false, emailVerifyToken: hashedToken, emailVerifyExpires: tokenExpiration
      }
    });

    return user;
  });

  const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${emailToken}`;
try {
    await sendEmail(
      email, 
      "Vérifiez votre adresse email", 
      `Bonjour ${firstName},\n\nMerci de demander l'accès. Cliquez ici pour vérifier votre email :\n\n${verifyUrl}`
    );
  } catch (err) {
    await prisma.user.delete({ where: { id: newUser.id } });
    throw new Error("EMAIL_SEND_FAILED");
  }

  return newUser;
};

//  Vérification d'email
exports.verifyEmailToken = async (token) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const professional = await prisma.professional.findFirst({
    where: { emailVerifyToken: hashedToken, emailVerifyExpires: { gt: new Date() } }
  });

  if (!professional) throw new Error("INVALID_TOKEN");

  await prisma.professional.update({
    where: { id: professional.id },
    data: { isEmailVerified: true, emailVerifyToken: null, emailVerifyExpires: null }
  });

  return true;
};

// Login
exports.loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { student: true, professor: true, administrator: true, professional: true }
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new Error("INVALID_CREDENTIALS");
  }

  if (user.role === 'PROFESSIONAL') {
    if (!user.professional || !user.professional.isEmailVerified) {
      throw new Error("EMAIL_NOT_VERIFIED");
    }

    if (user.accountStatus === 'PENDING') {
      throw new Error("ACCOUNT_PENDING_APPROVAL");
    }

    if (user.accountStatus === 'ACTIVE' && !user.professional.isVerified) {
      throw new Error("ACCOUNT_NOT_ACTIVE");
    }
  }

  if (user.accountStatus !== 'ACTIVE') {
    throw new Error("ACCOUNT_NOT_ACTIVE");
  }

  const roleId = getRoleId(user); // Utilisation de la fonction helper

  const accessToken = generateAccessToken({ userId: user.id, role: user.role, roleId });
  const refreshToken = generateRefreshToken({ userId: user.id });

  //  On ne retourne pas l'utilisateur entier (pour cacher le password)
  return { role: user.role, accessToken, refreshToken };
};

//  Récupérer les infos de l'utilisateur
exports.getUserById = async (userId) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, lastName: true, firstName: true, email: true, role: true }
  });
};

//  Renouveler le Token
exports.refreshUserToken = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { student: true, professor: true, administrator: true, professional: true }
  });

  if (!user || user.accountStatus !== 'ACTIVE') throw new Error("ACCOUNT_INACTIVE");

  if (
    user.role === 'PROFESSIONAL' &&
    (!user.professional || !user.professional.isEmailVerified || !user.professional.isVerified)
  ) {
    throw new Error("ACCOUNT_INACTIVE");
  }

  const roleId = getRoleId(user); // Utilisation de la fonction helper

  return generateAccessToken({ userId: user.id, role: user.role, roleId });
};
