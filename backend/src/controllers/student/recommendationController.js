'use strict';

const studentRecommendationService = require('../../services/studentRecommendationService');
const { handleStudentError } = require('../studentHelpers');
const { success, error } = require('../../utils/apiResponse');

const handleRecommendationError = (res, err) => {
  if (err.message === 'RECOMMENDATION_NOT_FOUND') {
    return error(res, 404, 'Recommandation introuvable.');
  }

  if (err.message === 'INVALID_RECOMMENDATION_VISIBILITY') {
    return error(res, 400, 'Visibilité de recommandation invalide.');
  }

  if (err.message === 'INVALID_RECOMMENDATION_STATUS') {
    return error(res, 400, 'Statut de recommandation invalide.');
  }

  return null;
};

exports.getRecommendations = async (req, res, next) => {
  try {
    const recommendations = await studentRecommendationService.listStudentRecommendations(
      req.user.userId,
      req.query,
    );

    return res.status(200).json({
      success: true,
      message: 'Recommandations étudiantes chargées.',
      data: recommendations,
      ...recommendations,
    });
  } catch (err) {
    if (handleRecommendationError(res, err)) return;
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getRecommendationById = async (req, res, next) => {
  try {
    const recommendation = await studentRecommendationService.getStudentRecommendationById(
      req.user.userId,
      req.params.recommendationId,
    );
    return success(res, 200, 'Recommandation chargée.', recommendation);
  } catch (err) {
    if (handleRecommendationError(res, err)) return;
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.updateRecommendationVisibility = async (req, res, next) => {
  try {
    const recommendation =
      await studentRecommendationService.updateStudentRecommendationVisibility(
        req.user.userId,
        req.params.recommendationId,
        req.body.visibility,
      );
    return success(res, 200, 'Visibilité de recommandation mise à jour.', recommendation);
  } catch (err) {
    if (handleRecommendationError(res, err)) return;
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.updateRecommendationStatus = async (req, res, next) => {
  try {
    const recommendation = await studentRecommendationService.updateStudentRecommendationStatus(
      req.user.userId,
      req.params.recommendationId,
      req.body.status,
    );
    return success(res, 200, 'Statut de recommandation mis à jour.', recommendation);
  } catch (err) {
    if (handleRecommendationError(res, err)) return;
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.updateRecommendationStatus = async (req, res, next) => {
  try {
    const recommendation = await studentRecommendationService.updateRecommendationStatus(
      req.user.userId,
      req.params.recommendationId,
      req.body.status,
    );
    return success(res, 200, 'Statut de la recommandation mis a jour.', recommendation);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};
