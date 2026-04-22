'use strict';

const { PrismaClient } = require('../generated/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Nécessaire pour le token de vérification d'email
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');
const { setCookies, clearCookies } = require('../utils/setCookies');
const sendEmail = require('../utils/sendEmail'); // Utilitaire d'envoi d'email

const prisma = new PrismaClient();

// 1. --- INSCRIPTION (Strictement réservée aux Professionnels) ---
exports.register = async (req, res, next) => {
  try {
    // On extrait uniquement les champs nécessaires (le rôle n'est pas demandé au frontend)
    const { email, password, lastName, firstName, company, jobTitle, ...profileData } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      // Création de l'utilisateur de base (Rôle forcé côté serveur)
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

      // Création du profil professionnel avec l'email NON vérifié par défaut
      await tx.professional.create({ 
        data: { 
          userId: newUser.id, 
          company,
          jobTitle,
          isEmailVerified: false, 
          ...profileData 
        } 
      });

      return newUser;
    });

    // Génération du Token pour l'email (valide 24 heures)
    const emailToken = jwt.sign(
      { userId: result.id }, 
      process.env.ACCESS_TOKEN_SECRET, 
      { expiresIn: '1d' }
    );

    // Construction de l'URL de vérification
    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${emailToken}`;
    
    // Envoi de l'email
    await sendEmail(
      email, 
      "Vérifiez votre adresse email - ValiDia", 
      `Bonjour ${firstName},\n\nMerci de demander l'accès à ValiDia. Veuillez cliquer sur ce lien pour vérifier votre adresse email :\n\n${verifyUrl}\n\nCe lien est valide pendant 24 heures.`
    );

    res.status(201).json({ 
      success: true, 
      message: "Demande envoyée. Veuillez vérifier votre boîte de réception pour valider votre email." 
    });
  } catch (err) {
    next(err);
  }
};

// 2. --- VÉRIFICATION DE L'EMAIL (Nouvelle fonction) ---
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ success: false, message: "Token de vérification manquant." });
    }

    // Vérification de la validité du token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Mise à jour de isEmailVerified dans la table Professional uniquement
    await prisma.professional.update({
      where: { userId: decoded.userId },
      data: { isEmailVerified: true }
    });

    res.json({ 
      success: true, 
      message: "Email vérifié avec succès. Votre demande est en attente de validation par l'administration." 
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ success: false, message: "Le lien de vérification a expiré." });
    }
    return res.status(400).json({ success: false, message: "Lien de vérification invalide." });
  }
};

// 3. --- CONNEXION (Login) ---
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

    // VÉRIFICATION DE L'EMAIL (Seulement si c'est un professionnel)
    if (user.role === 'PROFESSIONAL') {
      if (!user.professional || !user.professional.isEmailVerified) {
        return res.status(403).json({ 
          success: false, 
          message: "Veuillez vérifier votre email avant de vous connecter." 
        });
      }
    }

    // VÉRIFICATION DU STATUT DU COMPTE (Pour tout le monde)
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

// 4. --- INFORMATIONS UTILISATEUR ---
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

// 5. --- DÉCONNEXION ---
exports.logout = (req, res) => {
  clearCookies(res);
  res.json({ success: true, message: "Déconnexion réussie." });
};