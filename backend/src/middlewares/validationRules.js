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
      .toLowerCase(),

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
      .toLowerCase(),

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
      .toLowerCase(),
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
      .withMessage('Motif entre 3 et 200 caractères'),

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

// ── TIMELINE (Parcours académique étudiant) ──
const addTimelineRules = [
  body('title')
    .notEmpty().withMessage('Le titre est obligatoire')
    .isLength({ max: 255 }).withMessage('Le titre ne doit pas dépasser 255 caractères'),
  body('institution')
    .notEmpty().withMessage("L'établissement est obligatoire")
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

// ── ACADEMIC PATH (routes academicPathsRoutes) ──
const createAcademicPathRules = [
  body('institution').trim().notEmpty().withMessage('Établissement obligatoire').isLength({ min: 2, max: 255 }).withMessage('Établissement entre 2 et 255 caractères'),
  body('degree').trim().notEmpty().withMessage('Diplôme obligatoire').isLength({ min: 2, max: 255 }),
  body('field').optional({ nullable: true }).trim().isLength({ max: 150 }),
  body('major').optional({ nullable: true }).trim().isLength({ max: 150 }),
  body('startDate').optional({ nullable: true }).isISO8601().withMessage('Format date invalide (YYYY-MM-DD)'),
  body('endDate').optional({ nullable: true }).isISO8601().withMessage('Format date invalide'),
  body('honor').optional({ nullable: true }).trim().isLength({ max: 100 }),
];

const updateAcademicPathRules = [
  body('institution').optional().trim().notEmpty().isLength({ min: 2, max: 255 }),
  body('degree').optional().trim().notEmpty().isLength({ min: 2, max: 255 }),
  body('field').optional({ nullable: true }).trim().isLength({ max: 150 }),
  body('major').optional({ nullable: true }).trim().isLength({ max: 150 }),
  body('startDate').optional({ nullable: true }).isISO8601(),
  body('endDate').optional({ nullable: true }).isISO8601(),
  body('honor').optional({ nullable: true }).trim().isLength({ max: 100 }),
];

// ── STAGE (Internship étudiant) ──
const createStageRules = [
  body('company').trim().notEmpty().withMessage('Entreprise obligatoire').isLength({ min: 2, max: 150 }),
  body('duration').optional({ nullable: true }).isInt({ min: 1, max: 52 }).withMessage('Durée en semaines (1-52)'),
  body('startDate').optional({ nullable: true }).isISO8601().withMessage('Format date invalide'),
  body('endDate').optional({ nullable: true }).isISO8601().withMessage('Format date invalide'),
  body('visibility').optional().isIn(['PUBLIC', 'PRIVATE']).withMessage('Visibilité invalide'),
  body('technologies').optional().isArray({ max: 20 }),
  body('technologies.*').optional().trim().isLength({ min: 1, max: 50 }),
];

const updateStageRules = [
  body('company').optional().trim().notEmpty().isLength({ min: 2, max: 150 }),
  body('duration').optional({ nullable: true }).isInt({ min: 1, max: 52 }),
  body('startDate').optional({ nullable: true }).isISO8601(),
  body('endDate').optional({ nullable: true }).isISO8601(),
  body('visibility').optional().isIn(['PUBLIC', 'PRIVATE']),
];

// ── PROJECT (Projet étudiant) ──
const createProjectRules = [
  body('title').trim().notEmpty().withMessage('Titre obligatoire').isLength({ min: 2, max: 255 }),
  body('description').optional({ nullable: true }).trim().isLength({ max: 5000 }),
  body('type').trim().notEmpty().withMessage('Type obligatoire').isIn(['ACADEMIC', 'PERSONAL', 'PROFESSIONAL', 'OPEN_SOURCE']).withMessage('Type invalide'),
  body('teamSize').optional({ nullable: true }).isInt({ min: 1, max: 50 }),
  body('teamRole').optional({ nullable: true }).trim().isLength({ max: 100 }),
  body('githubUrl').optional({ nullable: true }).trim().isURL({ protocols: ['https'], host_whitelist: ['github.com'] }).withMessage('URL GitHub invalide'),
  body('youtubeUrl').optional({ nullable: true }).trim().isURL({ protocols: ['https'] }).withMessage('URL YouTube invalide'),
  body('visibility').optional().isIn(['PUBLIC', 'PRIVATE']),
  body('technologies').optional().isArray({ max: 20 }),
];

const updateProjectRules = [
  body('title').optional().trim().notEmpty().isLength({ min: 2, max: 255 }),
  body('description').optional({ nullable: true }).trim().isLength({ max: 5000 }),
  body('type').optional().isIn(['ACADEMIC', 'PERSONAL', 'PROFESSIONAL', 'OPEN_SOURCE']),
  body('teamSize').optional({ nullable: true }).isInt({ min: 1, max: 50 }),
  body('githubUrl').optional({ nullable: true }).trim().isURL({ protocols: ['https'], host_whitelist: ['github.com'] }),
  body('visibility').optional().isIn(['PUBLIC', 'PRIVATE']),
];

// ── CAREER GOAL ──
const updateCareerGoalRules = [
  body('careerGoal').optional({ nullable: true }).trim().isLength({ max: 1000 }),
  body('careerObjective').optional({ nullable: true }).trim().isLength({ max: 1000 }),
];

// ── VISIBILITY ──
const updateVisibilityRules = [
  body('visibility').notEmpty().withMessage('Visibilité obligatoire').isIn(['PUBLIC', 'PRIVATE']),
];

// ── TECHNOLOGIES ──
const addTechnologiesRules = [
  body('technologyIds').isArray({ min: 1, max: 20 }).withMessage('Entre 1 et 20 technologies'),
  body('technologyIds.*').isInt({ min: 1 }).withMessage('ID technologie invalide'),
];

// ── PROFILE ÉTUDIANT ──
const updateProfileRules = [
  body('firstName').optional().trim().notEmpty().isLength({ min: 2, max: 50 }).matches(/^[a-zA-ZÀ-ÿ\s\-]+$/).withMessage('Prénom invalide'),
  body('lastName').optional().trim().notEmpty().isLength({ min: 2, max: 50 }).matches(/^[a-zA-ZÀ-ÿ\s\-]+$/).withMessage('Nom invalide'),
  body('phone').optional({ nullable: true }).trim().matches(/^\+?[0-9]{7,15}$/).withMessage('Numéro invalide (ex: +212612345678)'),
  body('city').optional({ nullable: true }).trim().isLength({ max: 100 }).matches(/^[a-zA-ZÀ-ÿ\s\-]+$/).withMessage('Ville invalide'),
  body('bio').optional({ nullable: true }).trim().isLength({ max: 500 }),
  body('linkedinUrl').optional({ nullable: true }).trim().isURL({ protocols: ['https'], host_whitelist: ['linkedin.com', 'www.linkedin.com'] }).withMessage('URL LinkedIn invalide'),
  body('major').optional({ nullable: true }).trim().isLength({ min: 2, max: 100 }),
  body('field').optional({ nullable: true }).trim().isLength({ min: 2, max: 100 }),
  body('level').optional({ nullable: true }).isIn(['L1', 'L2', 'L3', 'M1', 'M2', 'GINF1', 'GINF2', 'GINF3', 'GINF4', 'GINF5']).withMessage('Niveau invalide'),
  body('careerGoal').optional({ nullable: true }).trim().isLength({ max: 1000 }),
];

// ── PROFILE PROFESSIONNEL ──
const updateProfessionalProfileRules = [
  body('firstName').optional().trim().notEmpty().isLength({ min: 2, max: 50 }).matches(/^[a-zA-ZÀ-ÿ\s\-]+$/).withMessage('Prénom invalide'),
  body('lastName').optional().trim().notEmpty().isLength({ min: 2, max: 50 }).matches(/^[a-zA-ZÀ-ÿ\s\-]+$/).withMessage('Nom invalide'),
  body('phone').optional({ nullable: true }).trim().matches(/^\+?[0-9]{7,15}$/).withMessage('Numéro invalide (ex: +212612345678)'),
  body('company').optional({ nullable: true }).trim().isLength({ min: 2, max: 150 }).withMessage('Entreprise entre 2 et 150 caractères'),
  body('jobTitle').optional({ nullable: true }).trim().isLength({ min: 2, max: 120 }).withMessage('Poste entre 2 et 120 caractères'),
  body('sector').optional({ nullable: true }).trim().isLength({ max: 100 }).withMessage('Secteur trop long'),
  body('bio').optional({ nullable: true }).trim().isLength({ max: 500 }).withMessage('Bio trop longue (max 500)'),
];

// ── ACTIVITY (Activité parascolaire) ──
const createActivityRules = [
  body('title').trim().notEmpty().withMessage('Titre obligatoire').isLength({ min: 2, max: 255 }),
  body('type').trim().notEmpty().withMessage('Type obligatoire').isIn(['SPORT', 'CULTURAL', 'VOLUNTEER', 'ASSOCIATION', 'COMPETITION', 'OTHER']).withMessage('Type invalide'),
  body('organization').optional({ nullable: true }).trim().isLength({ max: 150 }),
  body('description').optional({ nullable: true }).trim().isLength({ max: 2000 }),
  body('date').optional({ nullable: true }).isISO8601(),
  body('startDate').optional({ nullable: true }).isISO8601(),
  body('endDate').optional({ nullable: true }).isISO8601(),
  body('location').optional({ nullable: true }).trim().isLength({ max: 150 }),
  body('visibility').optional().isIn(['PUBLIC', 'PRIVATE']),
];

const updateActivityRules = [
  body('title').optional().trim().notEmpty().isLength({ min: 2, max: 255 }),
  body('type').optional().isIn(['SPORT', 'CULTURAL', 'VOLUNTEER', 'ASSOCIATION', 'COMPETITION', 'OTHER']),
  body('organization').optional({ nullable: true }).trim().isLength({ max: 150 }),
  body('description').optional({ nullable: true }).trim().isLength({ max: 2000 }),
  body('date').optional({ nullable: true }).isISO8601(),
  body('startDate').optional({ nullable: true }).isISO8601(),
  body('endDate').optional({ nullable: true }).isISO8601(),
  body('location').optional({ nullable: true }).trim().isLength({ max: 150 }),
  body('visibility').optional().isIn(['PUBLIC', 'PRIVATE']),
];

// ── SOFT SKILL ──
const addSoftSkillRules = [
  body('skillId').optional().isInt({ min: 1 }).withMessage('ID compétence invalide'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
];

// ── SETTINGS PASSWORD ──
const updatePasswordRules = [
  body('currentPassword').trim().notEmpty().withMessage('Mot de passe actuel obligatoire'),
  body('newPassword').trim().notEmpty().withMessage('Nouveau mot de passe obligatoire').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/).withMessage('Doit contenir majuscule, minuscule, chiffre et caractère spécial'),
  body('confirmPassword').optional().trim().custom((value, { req }) => {
    if (value && value !== req.body.newPassword) throw new Error('Les mots de passe ne correspondent pas');
    return true;
  }),
];

// ── SETTINGS PRIVACY ──
const updatePrivacyRules = [
  body('profileVisibility').optional().isIn(['PUBLIC', 'PRIVATE', 'CONNECTIONS_ONLY']),
  body('showEmail').optional().isBoolean(),
  body('showPhone').optional().isBoolean(),
];

// ── SETTINGS NOTIFICATIONS ──
const updateNotificationsRules = [
  body('email').optional().isBoolean(),
  body('push').optional().isBoolean(),
  body('validationUpdates').optional().isBoolean(),
  body('recommendations').optional().isBoolean(),
];

// ── RECOMMENDATION ──
const updateRecommendationVisibilityRules = [
  body('visibility').notEmpty().withMessage('Visibilité obligatoire').isIn(['PUBLIC', 'PRIVATE']),
];

const updateRecommendationStatusRules = [
  body('status').notEmpty().withMessage('Statut obligatoire').isIn(['ACCEPTED', 'REJECTED', 'PENDING']),
];

// ── PROFESSOR VALIDATION ──
const approveValidationRules = [
  body('comment').optional({ nullable: true }).trim().isLength({ max: 1000 }).withMessage('Commentaire trop long'),
  body('feedback').optional({ nullable: true }).trim().isLength({ max: 1000 }),
];

const rejectValidationRules = [
  body('comment').optional({ nullable: true }).trim().isLength({ max: 1000 }),
  body('reason').optional({ nullable: true }).trim().isLength({ max: 1000 }),
  body('feedback').optional({ nullable: true }).trim().isLength({ max: 1000 }),
];

const requestChangesRules = [
  body('comment').notEmpty().withMessage('Commentaire obligatoire pour demander des corrections').trim().isLength({ min: 10, max: 1000 }).withMessage('Commentaire entre 10 et 1000 caractères'),
  body('feedback').optional({ nullable: true }).trim().isLength({ max: 1000 }),
];

// ── ADMIN VALIDATION ──
const adminValidationActionRules = [
  body('comment').optional({ nullable: true }).trim().isLength({ max: 1000 }),
  body('reason').optional({ nullable: true }).trim().isLength({ max: 1000 }),
];

// ── ADMIN USER ──
const createUserRules = [
  body('firstName').trim().notEmpty().withMessage('Prénom obligatoire').isLength({ min: 2, max: 50 }).matches(/^[a-zA-ZÀ-ÿ\s\-]+$/).withMessage('Prénom invalide'),
  body('lastName').trim().notEmpty().withMessage('Nom obligatoire').isLength({ min: 2, max: 50 }).matches(/^[a-zA-ZÀ-ÿ\s\-]+$/).withMessage('Nom invalide'),
  body('email').trim().notEmpty().withMessage('Email obligatoire').isEmail().withMessage('Email invalide').toLowerCase(),
  body('password').trim().notEmpty().withMessage('Mot de passe obligatoire').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/).withMessage('Mot de passe invalide'),
  body('role').trim().notEmpty().withMessage('Rôle obligatoire').isIn(['STUDENT', 'PROFESSOR', 'ADMINISTRATOR', 'PROFESSIONAL']).withMessage('Rôle invalide'),
];

const updateUserRules = [
  body('firstName').optional().trim().notEmpty().isLength({ min: 2, max: 50 }).matches(/^[a-zA-ZÀ-ÿ\s\-]+$/).withMessage('Prénom invalide'),
  body('lastName').optional().trim().notEmpty().isLength({ min: 2, max: 50 }).matches(/^[a-zA-ZÀ-ÿ\s\-]+$/).withMessage('Nom invalide'),
  body('email').optional().trim().isEmail().withMessage('Email invalide').toLowerCase(),
  body('role').optional().isIn(['STUDENT', 'PROFESSOR', 'ADMINISTRATOR', 'PROFESSIONAL']).withMessage('Rôle invalide'),
];

const updateUserStatusRules = [
  body('status').trim().notEmpty().withMessage('Statut obligatoire').isIn(['ACTIVE', 'SUSPENDED', 'BANNED', 'PENDING']).withMessage('Statut invalide'),
  body('reason').optional({ nullable: true }).trim().isLength({ max: 500 }),
];

const updateUserRoleRules = [
  body('role').trim().notEmpty().withMessage('Rôle obligatoire').isIn(['STUDENT', 'PROFESSOR', 'ADMINISTRATOR', 'PROFESSIONAL']).withMessage('Rôle invalide'),
];

// ── ADMIN BADGE ──
const createBadgeRules = [
  body('name').trim().notEmpty().withMessage('Nom du badge obligatoire').isLength({ min: 2, max: 100 }),
  body('rule').trim().notEmpty().withMessage('Règle du badge obligatoire').isLength({ min: 2, max: 255 }),
  body('description').optional({ nullable: true }).trim().isLength({ max: 500 }),
  body('iconUrl').optional({ nullable: true }).trim().isURL().withMessage('URL icône invalide'),
  body('tone').optional({ nullable: true }).isIn(['DEFAULT', 'GOLD', 'SILVER', 'BRONZE', 'PLATINUM']).withMessage('Ton invalide'),
];

const updateBadgeRules = [
  body('name').optional().trim().notEmpty().isLength({ min: 2, max: 100 }),
  body('rule').optional().trim().notEmpty().isLength({ min: 2, max: 255 }),
  body('description').optional({ nullable: true }).trim().isLength({ max: 500 }),
  body('iconUrl').optional({ nullable: true }).trim().isURL().withMessage('URL icône invalide'),
  body('tone').optional({ nullable: true }).isIn(['DEFAULT', 'GOLD', 'SILVER', 'BRONZE', 'PLATINUM']),
];

module.exports = {
  validationRules,
  handleValidationErrors,
  addTimelineRules,
  updateTimelineRules,
  createAcademicPathRules,
  updateAcademicPathRules,
  createStageRules,
  updateStageRules,
  createProjectRules,
  updateProjectRules,
  updateCareerGoalRules,
  updateVisibilityRules,
  addTechnologiesRules,
  updateProfileRules,
  updateProfessionalProfileRules,
  createActivityRules,
  updateActivityRules,
  addSoftSkillRules,
  updatePasswordRules,
  updatePrivacyRules,
  updateNotificationsRules,
  updateRecommendationVisibilityRules,
  updateRecommendationStatusRules,
  approveValidationRules,
  rejectValidationRules,
  requestChangesRules,
  adminValidationActionRules,
  createUserRules,
  updateUserRules,
  updateUserStatusRules,
  updateUserRoleRules,
  createBadgeRules,
  updateBadgeRules,
};
