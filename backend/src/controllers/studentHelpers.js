'use strict';

const { error } = require('../utils/apiResponse');

const STUDENT_ERROR_RESPONSES = {
  STUDENT_PROFILE_NOT_FOUND: [404, 'Profil etudiant introuvable.'],
  ACADEMIC_PATH_NOT_FOUND: [404, 'Parcours academique introuvable.'],
  SOFT_SKILL_NOT_FOUND: [404, 'Competence comportementale introuvable.'],
  SOFT_SKILL_NAME_REQUIRED: [400, 'Le nom de la competence comportementale est requis.'],
  SKILL_NOT_FOUND: [404, 'Competence introuvable.'],
  STUDENT_SKILL_NOT_FOUND: [404, 'Competence etudiante introuvable.'],
  STUDENT_NOTIFICATION_NOT_FOUND: [404, 'Notification etudiante introuvable.'],
  GITHUB_NOT_CONFIGURED: [503, 'Integration GitHub non configuree.'],
  GITHUB_REPOSITORY_NAME_REQUIRED: [400, 'Le nom du depot GitHub est requis.'],
  CURRENT_PASSWORD_REQUIRED: [400, 'Le mot de passe actuel est requis.'],
  NEW_PASSWORD_REQUIRED: [400, 'Le nouveau mot de passe est requis.'],
  NEW_PASSWORD_TOO_SHORT: [400, 'Le nouveau mot de passe doit contenir au moins 8 caracteres.'],
  PASSWORD_CONFIRMATION_MISMATCH: [400, 'La confirmation du mot de passe ne correspond pas.'],
  CURRENT_PASSWORD_INVALID: [400, 'Le mot de passe actuel est incorrect.'],
  NEW_PASSWORD_SAME_AS_CURRENT: [400, 'Le nouveau mot de passe doit etre different du mot de passe actuel.'],
  INVALID_PROFILE_VISIBILITY: [400, 'La visibilite du profil est invalide.'],
  INVALID_PRIVACY_BOOLEAN_VALUE: [400, 'Les preferences de confidentialite doivent etre booleennes.'],
  INVALID_NOTIFICATION_BOOLEAN_VALUE: [400, 'Les preferences de notification doivent etre booleennes.'],
};

const handleStudentError = (res, err) => {
  const response = STUDENT_ERROR_RESPONSES[err.message];

  if (!response) {
    return null;
  }

  const [status, message] = response;
  return error(res, status, message);
};

module.exports = {
  handleStudentError,
};
