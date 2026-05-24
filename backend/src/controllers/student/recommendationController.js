'use strict';

const studentRecommendationService = require('../../services/studentRecommendationService');
const { handleStudentError } = require('../studentHelpers');
const { success } = require('../../utils/apiResponse');

exports.getRecommendations = async (req, res, next) => {
  try {
    const recommendations = await studentRecommendationService.listStudentRecommendations(
      req.user.userId,
      req.query,
    );
    return success(res, 200, 'Recommandations étudiantes chargées.', recommendations);
  } catch (err) {
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
