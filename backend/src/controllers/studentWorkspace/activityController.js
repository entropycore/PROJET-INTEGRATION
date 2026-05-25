'use strict';

const {
  workspaceService,
  fileService,
  success,
  error,
  wrap,
} = require('./shared');

exports.listActivities = wrap(async (req, res) =>
  success(res, 200, 'Activites recuperees.', await workspaceService.listActivities(req.user.userId))
);

exports.getActivity = wrap(async (req, res) =>
  success(res, 200, 'Activite recuperee.', await workspaceService.getActivity(req.user.userId, req.params.id))
);

exports.createActivity = wrap(async (req, res) =>
  success(res, 201, 'Activite creee.', await workspaceService.createActivity(req.user.userId, req.body))
);

exports.updateActivity = wrap(async (req, res) =>
  success(res, 200, 'Activite mise a jour.', await workspaceService.updateActivity(req.user.userId, req.params.id, req.body))
);

exports.deleteActivity = wrap(async (req, res) =>
  success(res, 200, 'Activite supprimee.', await workspaceService.deleteActivity(req.user.userId, req.params.id))
);

exports.submitActivity = wrap(async (req, res) =>
  success(res, 200, 'Activite soumise pour validation.', await workspaceService.submitActivity(req.user.userId, req.params.id))
);

exports.uploadActivityCertificate = wrap(async (req, res) => {
  const uploadedFile = await fileService.uploadFile({
    user: req.user,
    file: req.file,
    payload: { entityType: 'ACTIVITY', entityId: req.params.id, purpose: 'ACTIVITY_CERTIFICATE' },
  });
  return success(
    res,
    201,
    'Certificat ajoute.',
    await workspaceService.attachActivityCertificate(req.user.userId, req.params.id, uploadedFile)
  );
});

exports.downloadActivityCertificate = wrap(async (req, res) => {
  const certificate = await workspaceService.getActivityCertificate(req.user.userId, req.params.id);
  return res.redirect(certificate.documentUrl);
});
