'use strict';

const {
  workspaceService,
  fileService,
  success,
  error,
  wrap,
} = require('./shared');

exports.listRecommendations = wrap(async (req, res) =>
  success(
    res,
    200,
    'Recommandations recuperees.',
    await workspaceService.listRecommendations(req.user.userId, req.query)
  )
);

exports.getRecommendation = wrap(async (req, res) =>
  success(
    res,
    200,
    'Recommandation recuperee.',
    await workspaceService.getRecommendation(req.user.userId, req.params.id)
  )
);

exports.updateRecommendationVisibility = wrap(async (req, res) =>
  success(
    res,
    200,
    'Visibilite de la recommandation mise a jour.',
    await workspaceService.updateRecommendationVisibility(
      req.user.userId,
      req.params.id,
      req.body?.visibility
    )
  )
);

exports.updateRecommendationStatus = wrap(async (req, res) =>
  success(
    res,
    200,
    'Statut de la recommandation mis a jour.',
    await workspaceService.updateRecommendationStatus(
      req.user.userId,
      req.params.id,
      req.body?.status
    )
  )
);
