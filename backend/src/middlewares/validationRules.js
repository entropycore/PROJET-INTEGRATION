'use strict';

const { body, validationResult } = require('express-validator');

const rules = {
  // Règles login
  login: [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email obligatoire')
      .isEmail()
      .withMessage('Email invalide')
      .normalizeEmail(), //convertir en minuscules

    body('password')
      .trim()
      .notEmpty()
      .withMessage('Mot de passe obligatoire')
      .isLength({ min: 8 })
      .withMessage('Minimum 8 caractères'),
  ],
register: [
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Nom obligatoire')
    .isLength({ min: 2, max: 50 })
    .withMessage('Nom entre 2 et 50 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Nom invalide'),

  body('firstName')
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
    .withMessage('Mot de passe doit contenir majuscule, minuscule, chiffre et caractère spécial'),

  body('company')
    .trim()
    .notEmpty()
    .withMessage('Entreprise obligatoire')
    .isLength({ min: 2, max: 150 })
    .withMessage('Entreprise entre 2 et 150 caractères'),

  body('jobTitle')
    .trim()
    .notEmpty()
    .withMessage('Poste obligatoire')
    .isLength({ min: 2, max: 120 })
    .withMessage('Poste entre 2 et 120 caractères'),

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

  createReport: [
    body('targetType')
      .trim()
      .notEmpty()
      .withMessage('Type de cible obligatoire')
      .isIn(['PORTFOLIO', 'COMMENT', 'RECOMMENDATION', 'PROJECT', 'INTERNSHIP', 'USER', 'OTHER'])
      .withMessage('Type de cible invalide'),

    body('targetId')
      .optional({ values: 'falsy' })
      .trim()
      .isLength({ min: 1 })
      .withMessage('Identifiant de cible invalide'),

    body('reason')
      .trim()
      .notEmpty()
      .withMessage('Motif obligatoire')
      .isLength({ min: 3, max: 200 })
      .withMessage('Motif entre 3 et 200 caractÃ¨res'),

    body('description')
      .optional({ values: 'falsy' })
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Description trop longue'),
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


const addTimelineRules = [
  body('title')
    .notEmpty().withMessage('Le titre est obligatoire')
    .isLength({ max: 255 }).withMessage('Le titre ne doit pas dépasser 255 caractères'),
  body('institution')
    .notEmpty().withMessage('L’établissement est obligatoire')
    .isLength({ max: 255 }),
  body('startDate')
    .notEmpty().withMessage('La date de début est obligatoire')
    .isISO8601().withMessage('Format de date invalide (AAAA-MM-JJ)'),
  body('endDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('Format de date invalide'),
  body('description')
    .optional({ nullable: true })
    .isLength({ max: 2000 }),
];

const updateTimelineRules = [
  body('title').optional().notEmpty().isLength({ max: 255 }),
  body('institution').optional().notEmpty().isLength({ max: 255 }),
  body('startDate').optional().isISO8601(),
  body('endDate').optional({ nullable: true }).isISO8601(),
  body('description').optional({ nullable: true }).isLength({ max: 2000 }),
];
module.exports = {
  validationRules,
  handleValidationErrors,
  addTimelineRules,
  updateTimelineRules,
};