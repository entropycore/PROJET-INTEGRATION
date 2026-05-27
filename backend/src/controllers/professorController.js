'use strict';

const professorService = require('../services/professorService');
const { success, error } = require('../utils/apiResponse');

const handleProfessorError = (res, err) => {
  if (err.message === 'PROFESSOR_PROFILE_NOT_FOUND') {
    return error(res, 404, 'Profil professeur introuvable.');
  }

  if (err.message === 'PROFESSOR_VALIDATION_NOT_FOUND') {
    return error(res, 404, 'Validation professeur introuvable.');
  }

  if (err.message === 'PROFESSOR_VALIDATION_INVALID_STATE') {
    return error(res, 409, 'Cette validation ne peut plus etre modifiee.');
  }

  if (err.message === 'UNSUPPORTED_PROFESSOR_VALIDATION_TYPE') {
    return error(res, 400, 'Type de validation professeur invalide.');
  }

  if (err.message === 'UNSUPPORTED_PROFESSOR_VALIDATION_STATUS') {
    return error(res, 400, 'Statut de validation professeur invalide.');
  }

  if (err.message === 'PROFESSOR_PROFILE_REQUIRED_FIELDS') {
    return error(res, 400, 'Le prénom et le nom du professeur sont requis.');
  }

  if (err.message === 'PROFILE_PICTURE_UPLOAD_EMPTY') {
    return error(res, 400, 'Photo de profil requise.');
  }

  if (err.message === 'PROFILE_PICTURE_FILE_NOT_FOUND') {
    return error(res, 404, 'Photo de profil introuvable.');
  }

  if (err.message === 'CURRENT_PASSWORD_REQUIRED') {
    return error(res, 400, 'Le mot de passe actuel est requis.');
  }

  if (err.message === 'NEW_PASSWORD_REQUIRED') {
    return error(res, 400, 'Le nouveau mot de passe est requis.');
  }

  if (err.message === 'NEW_PASSWORD_TOO_SHORT') {
    return error(
      res,
      400,
      'Le nouveau mot de passe doit contenir au moins 8 caractères.',
    );
  }

  if (err.message === 'PASSWORD_CONFIRMATION_MISMATCH') {
    return error(res, 400, 'La confirmation du mot de passe ne correspond pas.');
  }

  if (err.message === 'CURRENT_PASSWORD_INVALID') {
    return error(res, 400, 'Le mot de passe actuel est incorrect.');
  }

  if (err.message === 'NEW_PASSWORD_SAME_AS_CURRENT') {
    return error(
      res,
      400,
      'Le nouveau mot de passe doit être différent du mot de passe actuel.',
    );
  }

  if (err.message === 'INVALID_PROFILE_VISIBILITY') {
    return error(res, 400, 'La visibilité du profil est invalide.');
  }

  if (err.message === 'INVALID_PRIVACY_BOOLEAN_VALUE') {
    return error(
      res,
      400,
      'Les préférences de confidentialité doivent être booléennes.',
    );
  }

  if (err.message === 'INVALID_NOTIFICATION_BOOLEAN_VALUE') {
    return error(
      res,
      400,
      'Les préférences de notification doivent être booléennes.',
    );
  }

  return null;
};

const buildEmptyDashboard = (user) => ({
  area: 'professor',
  user,
  profileSnapshot: null,
  summaryCards: {
    pendingProjects: { value: 0, label: 'Projets a valider' },
    pendingInternships: { value: 0, label: 'Stages a valider' },
    supervisedInternships: { value: 0, label: 'Stages supervises' },
    pendingSupervisedInternships: {
      value: 0,
      label: 'Stages supervises en attente',
    },
    completedProjectReviews: { value: 0, label: 'Avis projet rendus' },
    completedInternshipReviews: { value: 0, label: 'Avis stage rendus' },
  },
  pendingValidations: [],
  recentPendingProjects: [],
  recentPendingInternships: [],
  supervisedInternships: [],
  recentReviewActivity: [],
});

const buildEmptyProfile = (user) => ({
  user,
  profile: null,
  supervisedInternships: [],
  recentProjectValidations: [],
  recentInternshipValidations: [],
});

exports.getDashboard = async (req, res, next) => {
  try {
    const dashboard = await professorService.getProfessorDashboard(
      req.user.userId,
    );
    return success(res, 200, 'Tableau de bord professeur charge.', dashboard);
  } catch (err) {
    if (err.message === 'PROFESSOR_PROFILE_NOT_FOUND') {
      return success(
        res,
        200,
        'Tableau de bord professeur charge.',
        buildEmptyDashboard(req.user),
      );
    }

    if (handleProfessorError(res, err)) return;
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const profile = await professorService.getProfessorProfile(req.user.userId);
    return success(res, 200, 'Profil professeur charge.', profile);
  } catch (err) {
    if (err.message === 'PROFESSOR_PROFILE_NOT_FOUND') {
      return success(
        res,
        200,
        'Profil professeur charge.',
        buildEmptyProfile(req.user),
      );
    }

    if (handleProfessorError(res, err)) return;
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const profile = await professorService.updateProfessorProfile(
      req.user.userId,
      req.body || {},
    );
    return success(res, 200, 'Profil professeur mis à jour.', profile);
  } catch (err) {
    if (handleProfessorError(res, err)) return;
    next(err);
  }
};

exports.uploadProfilePicture = async (req, res, next) => {
  try {
    const result = await professorService.updateProfessorProfilePicture(
      req.user.userId,
      req.file,
    );
    return success(res, 200, 'Photo de profil mise à jour.', result);
  } catch (err) {
    if (handleProfessorError(res, err)) return;
    next(err);
  }
};

exports.getSettings = async (req, res, next) => {
  try {
    const settings = await professorService.getProfessorSettings(
      req.user.userId,
    );
    return success(res, 200, 'Paramètres professeur chargés.', settings);
  } catch (err) {
    if (handleProfessorError(res, err)) return;
    next(err);
  }
};

exports.updateSettingsPassword = async (req, res, next) => {
  try {
    const result = await professorService.updateProfessorSettingsPassword(
      req.user.userId,
      req.body || {},
    );
    return success(res, 200, 'Mot de passe professeur mis à jour.', result);
  } catch (err) {
    if (handleProfessorError(res, err)) return;
    next(err);
  }
};

exports.updateSettingsPrivacy = async (req, res, next) => {
  try {
    const privacy = await professorService.updateProfessorSettingsPrivacy(
      req.user.userId,
      req.body || {},
    );
    return success(
      res,
      200,
      'Préférences de confidentialité mises à jour.',
      privacy,
    );
  } catch (err) {
    if (handleProfessorError(res, err)) return;
    next(err);
  }
};

exports.updateSettingsNotifications = async (req, res, next) => {
  try {
    const notifications =
      await professorService.updateProfessorSettingsNotifications(
        req.user.userId,
        req.body || {},
      );
    return success(
      res,
      200,
      'Préférences de notification mises à jour.',
      notifications,
    );
  } catch (err) {
    if (handleProfessorError(res, err)) return;
    next(err);
  }
};

exports.listValidations = async (req, res, next) => {
  try {
    const validations = await professorService.listProfessorValidations(
      req.user.userId,
      {
        type: req.query.type,
        status: req.query.status || 'PENDING',
        search: req.query.search,
      },
    );

    return success(res, 200, 'Validations professeur chargees.', validations);
  } catch (err) {
    if (handleProfessorError(res, err)) return;
    next(err);
  }
};

exports.getValidationStats = async (req, res, next) => {
  try {
    const stats = await professorService.getProfessorValidationStats(
      req.user.userId,
    );
    return success(
      res,
      200,
      'Statistiques des validations professeur chargees.',
      stats,
    );
  } catch (err) {
    if (handleProfessorError(res, err)) return;
    next(err);
  }
};

exports.getValidationDetail = async (req, res, next) => {
  try {
    const validation = await professorService.getProfessorValidationDetail(
      req.user.userId,
      req.params.itemType,
      req.params.itemId,
    );

    return success(res, 200, 'Validation professeur chargee.', validation);
  } catch (err) {
    if (handleProfessorError(res, err)) return;
    next(err);
  }
};

exports.approveValidation = async (req, res, next) => {
  try {
    const validation = await professorService.approveProfessorValidation(
      req.user.userId,
      req.params.itemType,
      req.params.itemId,
      req.body || {},
    );

    return success(res, 200, 'Validation approuvee.', validation);
  } catch (err) {
    if (handleProfessorError(res, err)) return;
    next(err);
  }
};

exports.rejectValidation = async (req, res, next) => {
  try {
    const validation = await professorService.rejectProfessorValidation(
      req.user.userId,
      req.params.itemType,
      req.params.itemId,
      req.body || {},
    );

    return success(res, 200, 'Validation refusee.', validation);
  } catch (err) {
    if (handleProfessorError(res, err)) return;
    next(err);
  }
};

exports.requestValidationChanges = async (req, res, next) => {
  try {
    const validation = await professorService.requestProfessorValidationChanges(
      req.user.userId,
      req.params.itemType,
      req.params.itemId,
      req.body || {},
    );

    return success(res, 200, 'Demande de correction envoyee.', validation);
  } catch (err) {
    if (handleProfessorError(res, err)) return;
    next(err);
  }
};
