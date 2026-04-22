'use strict';

const { PrismaClient } = require('../generated/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');
const { setCookies, clearCookies } = require('../utils/setCookies');
const sendEmail = require('../utils/sendEmail');

const prisma = new PrismaClient();

// Inscription
exports.register = async (req, res, next) => {
  try {
    const { email, password, lastName, firstName, company, jobTitle } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const emailToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(emailToken).digest('hex');
    const tokenExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          lastName,
          firstName,
          passwordHash: hashedPassword,
          role: 'PROFESSIONAL', 
          accountStatus: 'PENDING' 
        }
      });

      await tx.professional.create({ 
        data: { 
          userId: newUser.id, 
          company,
          jobTitle,
          isEmailVerified: false,
          emailVerifyToken: hashedToken,
          emailVerifyExpires: tokenExpiration
        } 
      });

      return newUser;
    });

    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${emailToken}`;
    
    await sendEmail(
      email, 
      "Vérifiez votre adresse email", 
      `Bonjour ${firstName},\n\nMerci de demander l'accès à notre plateforme. Veuillez cliquer sur ce lien pour vérifier votre adresse email :\n\n${verifyUrl}\n\nCe lien est valide pendant 24 heures et à usage unique.`
    );

    res.status(201).json({ 
      success: true, 
      message: "Demande envoyée. Veuillez vérifier votre boîte de réception pour valider votre email." 
    });
  } catch (err) {
    next(err);
  }
};

// Vérification de l'email
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ success: false, message: "Token de vérification manquant." });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const professional = await prisma.professional.findFirst({
      where: {
        emailVerifyToken: hashedToken,
        emailVerifyExpires: { gt: new Date() }
      }
    });

    if (!professional) {
      return res.status(400).json({ success: false, message: "Lien de vérification invalide ou expiré." });
    }

    await prisma.professional.update({
      where: { id: professional.id },
      data: { 
        isEmailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpires: null
      }
    });

    res.json({ 
      success: true, 
      message: "Email vérifié avec succès. Votre demande est en attente de validation par l'administration." 
    });
  } catch (err) {
    next(err);
  }
};

// Connexion
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { student: true, professor: true, administrator: true, professional: true }
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ success: false, message: "Identifiants invalides." });
    }

    if (user.role === 'PROFESSIONAL') {
      if (!user.professional || !user.professional.isEmailVerified) {
        return res.status(403).json({ 
          success: false, 
          message: "Veuillez vérifier votre email avant de vous connecter." 
        });
      }
    }

    if (user.accountStatus !== 'ACTIVE') {
      return res.status(403).json({ success: false, message: "Votre compte est en attente d'activation ou a été suspendu." });
    }

    let roleId = null;
    if (user.role === 'STUDENT') roleId = user.student?.id;
    if (user.role === 'PROFESSIONAL') roleId = user.professional?.id;
    if (user.role === 'PROFESSOR') roleId = user.professor?.id;
    if (user.role === 'ADMINISTRATOR') roleId = user.administrator?.id;

    const accessToken = generateAccessToken({ 
      userId: user.id, 
      role: user.role, 
      roleId: roleId 
    });
    
    const refreshToken = generateRefreshToken({ userId: user.id });

    setCookies(res, accessToken, refreshToken);
    res.json({ success: true, message: "Connexion réussie", role: user.role });
  } catch (err) {
    next(err);
  }
};

// Informations utilisateur connecté
exports.getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, lastName: true, firstName: true, email: true, role: true }
    });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// Refresh Token
exports.refreshToken = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { student: true, professor: true, administrator: true, professional: true }
    });

    if (!user || user.accountStatus !== 'ACTIVE') {
      return res.status(403).json({ success: false, message: "Compte inactif ou non trouvé." });
    }

    let roleId = null;
    if (user.role === 'STUDENT') roleId = user.student?.id;
    if (user.role === 'PROFESSIONAL') roleId = user.professional?.id;
    if (user.role === 'PROFESSOR') roleId = user.professor?.id;
    if (user.role === 'ADMINISTRATOR') roleId = user.administrator?.id;
    
    const newAccessToken = generateAccessToken({ 
      userId: user.id, 
      role: user.role, 
      roleId: roleId 
    });

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 
    });

    res.json({ success: true, message: "Access Token renouvelé avec succès." });
  } catch (err) {
    next(err);
  }
};

// Déconnexion
exports.logout = (req, res) => {
  clearCookies(res);
  res.json({ success: true, message: "Déconnexion réussie." });
};