'use strict';

const { error } = require('../../utils/apiResponse');

const VALID_ACCOUNT_STATUSES = new Set(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING']);
const VALID_USER_ROLES = new Set(['STUDENT', 'PROFESSOR', 'ADMINISTRATOR', 'PROFESSIONAL']);
const VALID_VALIDATION_STATUSES = new Set(['PENDING', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED']);
const VALID_VALIDATION_TYPES = new Set([
  'CERTIFICATE_VALIDATION',
  'RECOMMENDATION_LETTER_VALIDATION',
  'COMMENT_VALIDATION',
  'RECOMMENDATION_VALIDATION',
]);
const VALID_NOTIFICATION_TYPES = new Set([
  'ACCESS_REQUEST',
  'CERTIFICATE_VALIDATION',
  'RECOMMENDATION_LETTER_VALIDATION',
  'COMMENT_VALIDATION',
  'RECOMMENDATION_VALIDATION',
  'REPORT',
  'SYSTEM',
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

const handleAdminError = (res, err) => {
  if (err.message === 'REQUEST_NOT_FOUND') {
    return error(res, 404, 'Demande professionnelle introuvable.');
  }

  if (err.message === 'USER_NOT_FOUND') {
    return error(res, 404, 'Utilisateur introuvable.');
  }

  if (err.message === 'ADMIN_PROFILE_NOT_FOUND') {
    return error(res, 404, 'Profil administrateur introuvable.');
  }

  if (err.message === 'DASHBOARD_ITEM_NOT_FOUND') {
    return error(res, 404, 'Element du dashboard introuvable.');
  }

  if (err.message === 'VALIDATION_ITEM_NOT_FOUND') {
    return error(res, 404, 'Element de validation introuvable.');
  }

  if (err.message === 'REPORT_NOT_FOUND') {
    return error(res, 404, 'Signalement introuvable.');
  }

  if (err.message === 'REPORT_TARGET_NOT_FOUND') {
    return error(res, 404, 'Contenu signale introuvable.');
  }

  if (err.message === 'REPORT_TARGET_DELETE_UNSUPPORTED') {
    return error(res, 409, "La suppression de cette cible de signalement n'est pas supportee.");
  }

  if (err.message === 'NOTIFICATION_NOT_FOUND') {
    return error(res, 404, 'Notification introuvable.');
  }

  if (err.message === 'INVALID_NOTIFICATION_TYPE') {
    return error(res, 400, 'Le type de notification est invalide.');
  }

  if (err.message === 'UNSUPPORTED_DASHBOARD_ITEM_TYPE') {
    return error(res, 400, "Le type d'element du dashboard n'est pas supporte.");
  }

  if (err.message === 'UNSUPPORTED_VALIDATION_TYPE') {
    return error(res, 400, "Le type de validation n'est pas supporte.");
  }

  if (err.message === 'UNSUPPORTED_REPORT_TARGET_TYPE') {
    return error(res, 400, "Le type de cible du signalement n'est pas supporte.");
  }

  if (err.message === 'INVALID_REPORT_STATUS') {
    return error(res, 400, 'Le status du signalement est invalide.');
  }

  if (err.message === 'UNSUPPORTED_DASHBOARD_ACTION_TYPE') {
    return error(res, 400, "L'action demandee n'est pas supportee pour ce type d'element.");
  }

  if (err.message === 'DASHBOARD_ITEM_INVALID_STATE') {
    return error(res, 409, "Cet element du dashboard ne peut pas etre traite dans son etat actuel.");
  }

  if (err.message === 'VALIDATION_ITEM_INVALID_STATE') {
    return error(res, 409, 'Cette validation ne peut pas etre traitee dans son etat actuel.');
  }

  if (err.message === 'REPORT_INVALID_STATE') {
    return error(res, 409, 'Ce signalement ne peut pas etre traite dans son etat actuel.');
  }

  if (err.message === 'EMAIL_NOT_VERIFIED') {
    return error(res, 409, "L'email du professionnel doit être vérifié avant approbation.");
  }

  if (err.message === 'REQUEST_ALREADY_APPROVED') {
    return error(res, 409, 'Cette demande a déjà été approuvée.');
  }

  if (err.message === 'INVALID_REQUEST_STATE') {
    return error(res, 409, 'Cette demande ne peut pas etre traitee dans son etat actuel.');
  }

  if (err.message === 'INVALID_ROLE') {
    return error(res, 400, 'Le role fourni est invalide.');
  }

  if (err.message === 'INVALID_STATUS') {
    return error(res, 400, 'Le status fourni est invalide.');
  }

  if (err.message === 'MISSING_REQUIRED_FIELDS') {
    return error(res, 400, 'Les champs obligatoires sont manquants.');
  }

  if (err.message === 'MISSING_STUDENT_FIELDS') {
    return error(res, 400, 'Les champs major et level sont obligatoires pour un etudiant.');
  }

  if (err.message === 'EMAIL_ALREADY_EXISTS') {
    return error(res, 409, 'Cet email est deja utilise.');
  }

  if (err.message === 'ROLE_CHANGE_REQUIRES_DEDICATED_ENDPOINT') {
    return error(res, 400, 'Utilisez la route dediee pour changer le role.');
  }

  if (err.message === 'ROLE_CHANGE_BLOCKED_BY_RELATED_DATA') {
    return error(
      res,
      409,
      'Le changement de role est bloque car ce compte possede deja des donnees metier liees.'
    );
  }

  if (err.message === 'USE_PROFESSIONAL_APPROVAL_FLOW') {
    return error(res, 409, 'Utilisez le workflow de validation professionnelle pour activer ce compte.');
  }

  if (err.message === 'CANNOT_DELETE_SELF') {
    return error(res, 409, 'Vous ne pouvez pas supprimer votre propre compte administrateur.');
  }

  if (err.message === 'CANNOT_CHANGE_OWN_ROLE') {
    return error(res, 409, 'Vous ne pouvez pas modifier le role de votre propre compte administrateur.');
  }

  if (err.message === 'USER_DELETE_BLOCKED_BY_RELATED_DATA') {
    return error(
      res,
      409,
      'La suppression est impossible car ce compte est encore lie a des donnees metier.'
    );
  }

  if (err.code === 'P2002') {
    return error(res, 409, 'Une valeur unique existe deja en base.');
  }

  if (err.code === 'P2003') {
    return error(
      res,
      409,
      'La suppression est impossible car ce compte est encore lie a des donnees metier.'
    );
  }

  if (err.code === 'P2025') {
    return error(res, 404, 'Ressource introuvable.');
  }

  return null;
};

module.exports = {
  VALID_ACCOUNT_STATUSES,
  VALID_USER_ROLES,
  VALID_VALIDATION_STATUSES,
  VALID_VALIDATION_TYPES,
  VALID_NOTIFICATION_TYPES,
  VALID_REPORT_STATUSES,
  VALID_REPORT_TARGET_TYPES,
  parseBooleanFilter,
  parsePositiveInt,
  normalizeRole,
  normalizeStatus,
  normalizeItemType,
  handleAdminError,
};
