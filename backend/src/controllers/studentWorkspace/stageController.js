'use strict';

const {
  workspaceService,
  fileService,
  success,
  error,
  wrap,
} = require('./shared');

exports.listStages = wrap(async (req, res) =>
  success(res, 200, 'Stages recuperes.', await workspaceService.listStages(req.user.userId))
);

exports.getStage = wrap(async (req, res) =>
  success(res, 200, 'Stage recupere.', await workspaceService.getStage(req.user.userId, req.params.id))
);

exports.createStage = wrap(async (req, res) =>
  success(res, 201, 'Stage cree.', await workspaceService.createStage(req.user.userId, req.body))
);

exports.updateStage = wrap(async (req, res) =>
  success(res, 200, 'Stage mis a jour.', await workspaceService.updateStage(req.user.userId, req.params.id, req.body))
);

exports.deleteStage = wrap(async (req, res) =>
  success(res, 200, 'Stage supprime.', await workspaceService.deleteStage(req.user.userId, req.params.id))
);

exports.submitStage = wrap(async (req, res) =>
  success(res, 200, 'Stage soumis pour validation.', await workspaceService.submitStage(req.user.userId, req.params.id))
);

exports.updateStageVisibility = wrap(async (req, res) =>
  success(
    res,
    200,
    'Visibilite du stage mise a jour.',
    await workspaceService.updateStageVisibility(req.user.userId, req.params.id, req.body?.visibility)
  )
);

exports.uploadStageReport = wrap(async (req, res) => {
  const uploadedFile = await fileService.uploadFile({
    user: req.user,
    file: req.file,
    payload: { entityType: 'INTERNSHIP', entityId: req.params.id, purpose: 'INTERNSHIP_REPORT' },
  });
  return success(
    res,
    201,
    'Rapport ajoute.',
    await workspaceService.attachStageReport(req.user.userId, req.params.id, uploadedFile)
  );
});

exports.downloadStageReport = wrap(async (req, res) => {
  const stage = await workspaceService.getStage(req.user.userId, req.params.id);
  if (!stage.reportUrl) return error(res, 404, 'Rapport introuvable.');
  return res.redirect(stage.reportUrl);
});

exports.uploadStageImages = wrap(async (req, res) => {
  const uploaded = [];
  for (const file of req.files || []) {
    const uploadedFile = await fileService.uploadFile({
      user: req.user,
      file,
      payload: { entityType: 'INTERNSHIP', entityId: req.params.id, purpose: 'INTERNSHIP_IMAGE' },
    });
    uploaded.push(await workspaceService.addStageImageRecord(req.user.userId, req.params.id, uploadedFile));
  }
  return success(res, 201, 'Images ajoutees.', uploaded);
});

exports.getStageImageContent = wrap(async (req, res) => {
  const image = await workspaceService.getStageImage(req.user.userId, req.params.id, req.params.mediaId);
  return res.redirect(image.url);
});

exports.deleteStageImage = wrap(async (req, res) =>
  success(
    res,
    200,
    'Image supprimee.',
    await workspaceService.deleteStageImage(req.user.userId, req.params.id, req.params.mediaId)
  )
);

exports.getStageValidationHistory = wrap(async (req, res) => {
  const stage = await workspaceService.getStage(req.user.userId, req.params.id);
  return success(res, 200, 'Historique de validation recupere.', stage.validationHistory || []);
});

exports.addStageTechnologies = wrap(async (req, res) => {
  const stage = await workspaceService.updateStage(req.user.userId, req.params.id, {
    technologies: req.body?.technologyIds || req.body?.technologies || [],
  });
  return success(res, 200, 'Technologies mises a jour.', stage);
});

exports.removeStageTechnology = wrap(async (req, res) => {
  const stage = await workspaceService.getStage(req.user.userId, req.params.id);
  const nextTechnologies = (stage.technologies || []).filter((item) => item !== req.params.technologyId);
  return success(
    res,
    200,
    'Technologie supprimee.',
    await workspaceService.updateStage(req.user.userId, req.params.id, { technologies: nextTechnologies })
  );
});
