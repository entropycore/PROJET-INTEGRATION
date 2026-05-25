'use strict';

const {
  workspaceService,
  fileService,
  success,
  error,
  wrap,
} = require('./shared');

exports.updatePassword = wrap(async (req, res) =>
  success(res, 200, 'Mot de passe mis a jour.', await workspaceService.updatePassword(req.user.userId, req.body))
);

exports.updatePrivacyPreferences = wrap(async (req, res) =>
  success(
    res,
    200,
    'Preferences de confidentialite mises a jour.',
    await workspaceService.updatePrivacyPreferences(req.user.userId, req.body)
  )
);

exports.updateNotificationPreferences = wrap(async (req, res) =>
  success(
    res,
    200,
    'Preferences de notifications mises a jour.',
    await workspaceService.updateNotificationPreferences(req.user.userId, req.body)
  )
);
