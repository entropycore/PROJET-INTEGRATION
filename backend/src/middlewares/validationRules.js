'use strict';

const { body, validationResult } = require('express-validator');

// ── RÈGLES PAR TYPE ──
const rules = {
  // Règles login
  login: [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email obligatoire')
      .isEmail()
      .withMessage('Email invalide')
      .normalizeEmail(),

    body('password')
      .trim()
      .notEmpty()
      .withMessage('Mot de passe obligatoire')
      .isLength({ min: 8 })
      .withMessage('Minimum 8 caractères'),
  ],

  // Règles inscription
  register: [
    body('lastName') // <-- Modifié ici (au lieu de 'nom')
      .trim()
      .notEmpty()
      .withMessage('Nom obligatoire')
      .isLength({ min: 2, max: 50 })
      .withMessage('Nom entre 2 et 50 caractères')
      .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
      .withMessage('Nom invalide'),

    body('firstName') // <-- Modifié ici (au lieu de 'prenom')
      .trim()
      .notEmpty()
      .withMessage('Prénom obligatoire')
      .isLength({ min: 2, max: 50 })
      .withMessage('Prénom entre 2 et 50 caractères')
      .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
      .withMessage('Prénom invalide'),

    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email obligatoire')
      .isEmail()
      .withMessage('Email invalide')
      .normalizeEmail(),

    body('password')
      .trim()
      .notEmpty()
      .withMessage('Mot de passe obligatoire')
      .isLength({ min: 8 })
      .withMessage('Minimum 8 caractères')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
      .withMessage(
        'Mot de passe doit contenir majuscule, minuscule, chiffre et caractère spécial'
      ),

   // body('role')
     // .trim()
     // .notEmpty()
     // .withMessage('Rôle obligatoire')
      // .isIn(['etudiant', 'professeur', 'admin', 'professionnel'])
     // .withMessage('Rôle invalide'),
  ],

  // Règles forgotPassword
  forgotPassword: [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email obligatoire')
      .isEmail()
      .withMessage('Email invalide')
      .normalizeEmail(),
  ],

  // Règles resetPassword
  resetPassword: [
    body('token').trim().notEmpty().withMessage('Token obligatoire'),

    body('newPassword')
      .trim()
      .notEmpty()
      .withMessage('Nouveau mot de passe obligatoire')
      .isLength({ min: 8 })
      .withMessage('Minimum 8 caractères')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
      .withMessage(
        'Mot de passe doit contenir majuscule, minuscule, chiffre et caractère spécial'
      ),
  ],
};

// ── FONCTION PRINCIPALE ──
const validationRules = (type) => {
  return rules[type] || [];
};

// ── MIDDLEWARE VÉRIFICATION ──
// À appeler après validationRules()
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Données invalides',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
};

module.exports = { validationRules, handleValidationErrors };