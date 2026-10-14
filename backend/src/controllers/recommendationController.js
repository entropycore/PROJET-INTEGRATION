'use strict';

const reportService = require('../services/reportService');
const studentRecommendationService = require('../services/studentRecommendationService');
const { success, error } = require('../utils/apiResponse');

exports.getRecommendationById = async (req, res, next) => {
  try {
    const recommendation = await studentRecommendationService.getStudentRecommendationById(
      req.user.userId,
      req.params.recommendationId,
    );

    return res.status(200).json({
      success: true,
      message: 'Recommandation chargée.',
      data: recommendation,
      recommendation,
    });
  } catch (err) {
    if (err.message === 'STUDENT_PROFILE_NOT_FOUND') {
      return error(res, 404, 'Profil étudiant introuvable.');
    }

    if (err.message === 'RECOMMENDATION_NOT_FOUND') {
      return error(res, 404, 'Recommandation introuvable.');
    }

    next(err);
  }
};

exports.reportRecommendation = async (req, res, next) => {
  try {
    await studentRecommendationService.getStudentRecommendationById(
      req.user.userId,
      req.params.recommendationId,
    );

    const report = await reportService.createReport({
      reporterUserId: req.user.userId,
      targetType: 'RECOMMENDATION',
      targetId: req.params.recommendationId,
      reason: req.body.reason,
      description: req.body.description,
    });

    return success(res, 201, 'Recommandation signalée.', report);
  } catch (err) {
    if (err.message === 'STUDENT_PROFILE_NOT_FOUND') {
      return error(res, 404, 'Profil étudiant introuvable.');
    }

    if (err.message === 'RECOMMENDATION_NOT_FOUND') {
      return error(res, 404, 'Recommandation introuvable.');
    }

    if (err.message === 'INVALID_REPORT_TARGET_TYPE') {
      return error(res, 400, 'Le type de signalement est invalide.');
    }

    if (err.message === 'REPORT_TARGET_NOT_FOUND') {
      return error(res, 404, 'La recommandation signalée est introuvable.');
    }

    if (err.message === 'REPORT_ALREADY_EXISTS') {
      return error(res, 409, 'Un signalement en attente existe déjà.');
    }

    next(err);
  }
};
