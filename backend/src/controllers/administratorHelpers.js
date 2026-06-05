'use strict';

const { error } = require('../utils/apiResponse');

const VALID_ACCOUNT_STATUSES = new Set(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING']);
const VALID_USER_ROLES = new Set(['STUDENT', 'PROFESSOR', 'ADMINISTRATOR', 'PROFESSIONAL']);
const VALID_VALIDATION_STATUSES = new Set(['PENDING', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED']);
const VALID_VALIDATION_TYPES = new Set([
  'PROJECT',
  'INTERNSHIP',
  'CERTIFICATE_VALIDATION',
  'RECOMMENDATION_LETTER_VALIDATION',
  'COMMENT_VALIDATION',
  'RECOMMENDATION_VALIDATION',
]);
const VALID_LEGACY_VALIDATION_TYPES = new Set(['PROJECT', 'INTERNSHIP', 'CERTIFICATE', 'ACTIVITY']);
const VALID_NOTIFICATION_TYPES = new Set([
  'ACCESS_REQUEST',
  'CERTIFICATE_VALIDATION',
  'RECOMMENDATION_LETTER_VALIDATION',
  'COMMENT_VALIDATION',
  'RECOMMENDATION_VALIDATION',
  'REPORT',
  'SYSTEM',
  'INFO',
  'VALIDATION',
  'ALERT',
]);
const VALID_REPORT_STATUSES = new Set(['PENDING', 'APPROVED', 'REJECTED']);
const VALID_REPORT_TARGET_TYPES = new Set([
  'PORTFOLIO',
  'COMMENT',
  'RECOMMENDATION',
  'PROJECT',
  'INTERNSHIP',
  'USER',
  'OTHER',
]);

const ADMIN_ERROR_RESPONSES = {
  REQUEST_NOT_FOUND: [404, 'Demande professionnelle introuvable.'],
  USER_NOT_FOUND: [404, 'Utilisateur introuvable.'],
  ADMIN_PROFILE_NOT_FOUND: [404, 'Profil administrateur introuvable.'],
  DASHBOARD_ITEM_NOT_FOUND: [404, 'Élément du dashboard introuvable.'],
  VALIDATION_ITEM_NOT_FOUND: [404, 'Élément de validation introuvable.'],
  ADMIN_VALIDATION_FILE_NOT_FOUND: [404, 'Fichier de validation introuvable.'],
  REPORT_NOT_FOUND: [404, 'Signalement introuvable.'],
  REPORT_TARGET_NOT_FOUND: [404, 'Cible du signalement introuvable.'],
  NOTIFICATION_NOT_FOUND: [404, 'Notification introuvable.'],
  BADGE_NOT_FOUND: [404, 'Badge introuvable.'],
  INVALID_NOTIFICATION_TYPE: [400, 'Le type de notification est invalide.'],
  BADGE_REQUIRED_FIELDS: [400, 'Les champs name et rule sont obligatoires pour un badge.'],
  UNSUPPORTED_DASHBOARD_ITEM_TYPE: [400, "Le type d'élément du dashboard n'est pas supporté."],
  UNSUPPORTED_VALIDATION_TYPE: [400, "Le type de validation n'est pas supporté."],
  UNSUPPORTED_LEGACY_VALIDATION_TYPE: [400, "Le type de validation legacy n'est pas supporté."],
  UNSUPPORTED_REPORT_TARGET_TYPE: [400, "Le type de cible du signalement n'est pas supporté."],
  INVALID_REPORT_STATUS: [400, 'Le status du signalement est invalide.'],
  UNSUPPORTED_DASHBOARD_ACTION_TYPE: [400, "L'action demandée n'est pas supportée pour ce type d'élément."],
  DASHBOARD_ITEM_INVALID_STATE: [409, 'Cet élément du dashboard ne peut pas être traité dans son état actuel.'],
  VALIDATION_ITEM_INVALID_STATE: [409, 'Cette validation ne peut pas être traitée dans son état actuel.'],
  REPORT_INVALID_STATE: [409, 'Ce signalement ne peut pas être traité dans son état actuel.'],
  EMAIL_NOT_VERIFIED: [409, "L'email du professionnel doit être vérifié avant approbation."],
  REQUEST_ALREADY_APPROVED: [409, 'Cette demande a déjà été approuvée.'],
  INVALID_REQUEST_STATE: [409, 'Cette demande ne peut pas être traitée dans son état actuel.'],
  INVALID_ROLE: [400, 'Le rôle fourni est invalide.'],
  INVALID_STATUS: [400, 'Le status fourni est invalide.'],
  MISSING_REQUIRED_FIELDS: [400, 'Les champs obligatoires sont manquants.'],
  MISSING_STUDENT_FIELDS: [400, 'Les champs major et level sont obligatoires pour un étudiant.'],
  EMAIL_ALREADY_EXISTS: [409, 'Cet email est déjà utilisé.'],
  USER_EMAIL_SEND_FAILED: [500, "Le compte n'a pas été conservé car l'envoi des identifiants par email a échoué."],
  USER_RESET_EMAIL_SEND_FAILED: [
    500,
    "Le mot de passe n'a pas été modifié car l'envoi du nouvel identifiant par email a échoué.",
  ],
  BADGE_NAME_ALREADY_EXISTS: [409, 'Un badge avec ce nom existe déjà.'],
  ROLE_CHANGE_REQUIRES_DEDICATED_ENDPOINT: [400, 'Utilisez la route dédiée pour changer le rôle.'],
  ROLE_CHANGE_BLOCKED_BY_RELATED_DATA: [
    409,
    'Le changement de rôle est bloqué car ce compte possède déjà des données métier liées.',
  ],
  USE_PROFESSIONAL_APPROVAL_FLOW: [409, 'Utilisez le workflow de validation professionnelle pour activer ce compte.'],
  CANNOT_DELETE_SELF: [409, 'Vous ne pouvez pas supprimer votre propre compte administrateur.'],
  CANNOT_CHANGE_OWN_ROLE: [409, 'Vous ne pouvez pas modifier le rôle de votre propre compte administrateur.'],
  USER_DELETE_BLOCKED_BY_RELATED_DATA: [
    409,
    'La suppression est impossible car ce compte est encore lié à des données métier.',
  ],
  BADGE_FEATURE_UNAVAILABLE: [503, "Le module badges n'est pas disponible sur cette instance."],
};

const PRISMA_ERROR_RESPONSES = {
  P2002: [409, 'Une valeur unique existe déjà en base.'],
  P2003: [409, 'La suppression est impossible car ce compte est encore lié à des données métier.'],
};

const parseBooleanFilter = (value) => {
  if (typeof value === 'undefined') return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
};

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < 1 ? fallback : parsed;
};

const normalizeRole = (value) => (typeof value === 'string' ? value.toUpperCase() : value);
const normalizeStatus = (value) => (typeof value === 'string' ? value.toUpperCase() : value);
const normalizeItemType = (value) =>
  typeof value === 'string' ? value.trim().toUpperCase().replace(/-/g, '_') : value;

const getReportStatusFilter = (value) => {
  const status = normalizeStatus(value);

  if (!status) return 'PENDING';
  if (status === 'ALL') return null;
  if (status === 'RESOLVED') return 'APPROVED';
  return status;
};

const readBodyText = (body, names) => {
  for (const name of names) {
    if (typeof body?.[name] === 'string') {
      return body[name].trim() || null;
    }
  }

  return null;
};

const handleAdminError = (res, err) => {
  const response = ADMIN_ERROR_RESPONSES[err.message] || PRISMA_ERROR_RESPONSES[err.code];

  if (!response) {
    return null;
  }

  const [status, message] = response;
  return error(res, status, message);
};

module.exports = {
  VALID_ACCOUNT_STATUSES,
  VALID_LEGACY_VALIDATION_TYPES,
  VALID_NOTIFICATION_TYPES,
  VALID_REPORT_STATUSES,
  VALID_REPORT_TARGET_TYPES,
  VALID_USER_ROLES,
  VALID_VALIDATION_STATUSES,
  VALID_VALIDATION_TYPES,
  getReportStatusFilter,
  handleAdminError,
  normalizeItemType,
  normalizeRole,
  normalizeStatus,
  parseBooleanFilter,
  parsePositiveInt,
  readBodyText,
};
