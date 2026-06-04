'use strict';

const studentPortfolioService = require('../services/studentPortfolioService');
const { error } = require('../utils/apiResponse');

exports.listPublicPortfolios = async (_req, res, next) => {
  try {
    const portfolios = await studentPortfolioService.listPublicPortfolios();

    return res.status(200).json({
      success: true,
      message: 'Portfolios publics charges.',
      data: portfolios,
    });
  } catch (err) {
    next(err);
  }
};

exports.getPublicPortfolio = async (req, res, next) => {
  try {
    const portfolio = await studentPortfolioService.getPublicPortfolioBySlug(
      req.params.slug,
    );

    return res.status(200).json({
      success: true,
      message: 'Portfolio public chargé.',
      data: portfolio,
      ...portfolio,
    });
  } catch (err) {
    if (err.message === 'PUBLIC_PORTFOLIO_NOT_FOUND') {
      return error(res, 404, 'Portfolio public introuvable.');
    }

    next(err);
  }
};
