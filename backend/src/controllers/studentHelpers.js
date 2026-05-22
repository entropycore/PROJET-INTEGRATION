'use strict';

const { error } = require('../utils/apiResponse');

const STUDENT_ERROR_RESPONSES = {
  STUDENT_PROFILE_NOT_FOUND: [404, 'Profil étudiant introuvable.'],
  ACADEMIC_PATH_NOT_FOUND: [404, 'Parcours académique introuvable.'],
  SOFT_SKILL_NOT_FOUND: [404, 'Compétence comportementale introuvable.'],
  SOFT_SKILL_NAME_REQUIRED: [400, 'Le nom de la compétence comportementale est requis.'],
  SKILL_NOT_FOUND: [404, 'Compétence introuvable.'],
  STUDENT_SKILL_NOT_FOUND: [404, 'Compétence étudiante introuvable.'],
  STUDENT_NOTIFICATION_NOT_FOUND: [404, 'Notification étudiante introuvable.'],
  GITHUB_NOT_CONFIGURED: [503, 'Intégration GitHub non configurée.'],
  GITHUB_REPOSITORY_NAME_REQUIRED: [400, 'Le nom du dépôt GitHub est requis.'],
  CURRENT_PASSWORD_REQUIRED: [400, 'Le mot de passe actuel est requis.'],
  NEW_PASSWORD_REQUIRED: [400, 'Le nouveau mot de passe est requis.'],
  NEW_PASSWORD_TOO_SHORT: [400, 'Le nouveau mot de passe doit contenir au moins 8 caractères.'],
  PASSWORD_CONFIRMATION_MISMATCH: [400, 'La confirmation du mot de passe ne correspond pas.'],
  CURRENT_PASSWORD_INVALID: [400, 'Le mot de passe actuel est incorrect.'],
  NEW_PASSWORD_SAME_AS_CURRENT: [400, 'Le nouveau mot de passe doit être différent du mot de passe actuel.'],
  INVALID_PROFILE_VISIBILITY: [400, 'La visibilité du profil est invalide.'],
  INVALID_PRIVACY_BOOLEAN_VALUE: [400, 'Les préférences de confidentialité doivent être booléennes.'],
  INVALID_NOTIFICATION_BOOLEAN_VALUE: [400, 'Les préférences de notification doivent être booléennes.'],
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
