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
