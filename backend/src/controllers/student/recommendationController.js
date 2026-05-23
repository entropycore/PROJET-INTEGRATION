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
