'use strict';

const {
  workspaceService,
  fileService,
  success,
  error,
  wrap,
} = require('./shared');

exports.getCredibilityScore = wrap(async (req, res) => {
  const data = await workspaceService.getDashboardExtras(req.user.userId);
  return success(res, 200, 'Score recupere.', { score: data.credibilityScore });
});

exports.getProfileCompletion = wrap(async (req, res) => {
  const data = await workspaceService.getDashboardExtras(req.user.userId);
  return success(res, 200, 'Completion profil recuperee.', { completion: data.profileCompletion });
});

exports.getTimeline = wrap(async (req, res) => {
  const data = await workspaceService.getDashboardExtras(req.user.userId);
  return success(res, 200, 'Timeline recuperee.', data.timeline);
});

exports.listBadges = wrap(async (_req, res) =>
  success(res, 200, 'Badges recuperes.', await workspaceService.listBadges())
);
