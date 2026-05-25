'use strict';

const {
  workspaceService,
  fileService,
  success,
  error,
  wrap,
} = require('./shared');

exports.getPortfolioPreview = wrap(async (req, res) =>
  success(res, 200, 'Portfolio recupere.', await workspaceService.getPortfolioPreview(req.user.userId))
);

exports.generatePortfolio = wrap(async (req, res) =>
  success(res, 200, 'Portfolio genere.', await workspaceService.generatePortfolio(req.user.userId, req.body))
);

exports.getPublicPortfolio = wrap(async (req, res) =>
  success(res, 200, 'Portfolio public recupere.', await workspaceService.getPublicPortfolio(req.params.slug))
);
