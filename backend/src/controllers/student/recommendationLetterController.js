'use strict';

const studentRecommendationLetterService = require('../../services/studentRecommendationLetterService');
const { handleStudentError } = require('../studentHelpers');
const { success, error } = require('../../utils/apiResponse');

const handleRecommendationLetterError = (res, err) => {
  if (err.message === 'RECOMMENDATION_LETTER_NOT_FOUND') {
    return error(res, 404, 'Lettre de recommandation introuvable.');
  }

  if (err.message === 'INVALID_RECOMMENDATION_LETTER_VISIBILITY') {
    return error(res, 400, 'Visibilite de lettre de recommandation invalide.');
  }

  if (err.message === 'INVALID_RECOMMENDATION_LETTER_DOWNLOADABLE') {
    return error(res, 400, 'Option telechargeable invalide.');
  }

  return null;
};

exports.getRecommendationLetters = async (req, res, next) => {
  try {
    const letters =
      await studentRecommendationLetterService.listStudentRecommendationLetters(
        req.user.userId,
        req.query,
      );

    return success(res, 200, 'Lettres de recommandation chargees.', letters);
  } catch (err) {
    if (handleRecommendationLetterError(res, err)) return;
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getRecommendationLetterById = async (req, res, next) => {
  try {
    const letter =
      await studentRecommendationLetterService.getStudentRecommendationLetterById(
        req.user.userId,
        req.params.letterId,
      );

    return success(res, 200, 'Lettre de recommandation chargee.', letter);
  } catch (err) {
    if (handleRecommendationLetterError(res, err)) return;
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.updateRecommendationLetterVisibility = async (req, res, next) => {
  try {
    const letter =
      await studentRecommendationLetterService.updateStudentRecommendationLetterVisibility(
        req.user.userId,
        req.params.letterId,
        req.body.visibility,
      );

    return success(res, 200, 'Visibilite de lettre mise a jour.', letter);
  } catch (err) {
    if (handleRecommendationLetterError(res, err)) return;
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.updateRecommendationLetterDownloadable = async (req, res, next) => {
  try {
    const letter =
      await studentRecommendationLetterService.updateStudentRecommendationLetterDownloadable(
        req.user.userId,
        req.params.letterId,
        req.body.downloadable,
      );

    return success(res, 200, 'Option telechargeable mise a jour.', letter);
  } catch (err) {
    if (handleRecommendationLetterError(res, err)) return;
    if (handleStudentError(res, err)) return;
    next(err);
  }
};
