'use strict';

const studentPortfolioService = require('../services/studentPortfolioService');
const { error } = require('../utils/apiResponse');

const sendPortfolioResponse = (res, statusCode, message, portfolioData) =>
  res.status(statusCode).json({
    success: true,
    message,
    data: portfolioData,
    ...portfolioData,
  });

const handlePortfolioError = (res, err) => {
  if (err.message === 'STUDENT_PROFILE_NOT_FOUND') {
    return error(res, 404, 'Profil étudiant introuvable.');
  }

  if (err.message === 'INVALID_PORTFOLIO_THEME') {
    return error(res, 400, 'Thème portfolio invalide.');
  }

  return null;
};

exports.getPreview = async (req, res, next) => {
  try {
    const preview = await studentPortfolioService.getStudentPortfolioPreview(
      req.user.userId,
    );

    return sendPortfolioResponse(res, 200, 'Aperçu portfolio chargé.', preview);
  } catch (err) {
    if (handlePortfolioError(res, err)) return;
    next(err);
  }
};

exports.generatePortfolio = async (req, res, next) => {
  try {
    const portfolio = await studentPortfolioService.generateStudentPortfolio(
      req.user.userId,
      req.body,
    );

    return sendPortfolioResponse(res, 201, 'Portfolio généré.', portfolio);
  } catch (err) {
    if (handlePortfolioError(res, err)) return;
    next(err);
  }
};
