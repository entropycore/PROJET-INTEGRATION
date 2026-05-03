'use strict';

const { body, validationResult } = require('express-validator');

const rules = {
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
      .withMessage('Minimum 8 caracteres'),
  ],

  register: [
    body('lastName')
      .trim()
      .notEmpty()
      .withMessage('Nom obligatoire')
      .isLength({ min: 2, max: 50 })
      .withMessage('Nom entre 2 et 50 caracteres')
      .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
      .withMessage('Nom invalide'),

    body('firstName')
      .trim()
      .notEmpty()
      .withMessage('Prenom obligatoire')
      .isLength({ min: 2, max: 50 })
      .withMessage('Prenom entre 2 et 50 caracteres')
      .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
      .withMessage('Prenom invalide'),

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
      .withMessage('Minimum 8 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
      .withMessage('Mot de passe doit contenir majuscule, minuscule, chiffre et caractere special'),

    body('company')
      .trim()
      .notEmpty()
      .withMessage("Nom de l'entreprise obligatoire")
      .isLength({ min: 2, max: 150 })
      .withMessage("Nom de l'entreprise entre 2 et 150 caracteres"),

    body('jobTitle')
      .trim()
      .notEmpty()
      .withMessage('Poste obligatoire')
      .isLength({ min: 2, max: 120 })
      .withMessage('Poste entre 2 et 120 caracteres'),
  ],

  forgotPassword: [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email obligatoire')
      .isEmail()
      .withMessage('Email invalide')
      .normalizeEmail(),
  ],

  resetPassword: [
    body('token').trim().notEmpty().withMessage('Token obligatoire'),

    body('newPassword')
      .trim()
      .notEmpty()
      .withMessage('Nouveau mot de passe obligatoire')
      .isLength({ min: 8 })
      .withMessage('Minimum 8 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
      .withMessage(
        'Mot de passe doit contenir majuscule, minuscule, chiffre et caractere special'
      ),
  ],
};

const validationRules = (type) => {
  return rules[type] || [];
};

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Donnees invalides',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
};

module.exports = { validationRules, handleValidationErrors };
