'use strict';

const {
  workspaceService,
  fileService,
  success,
  error,
  wrap,
} = require('./shared');

exports.listProjects = wrap(async (req, res) =>
  success(res, 200, 'Projets recuperes.', await workspaceService.listProjects(req.user.userId))
);

exports.getProject = wrap(async (req, res) =>
  success(res, 200, 'Projet recupere.', await workspaceService.getProject(req.user.userId, req.params.id))
);

exports.createProject = wrap(async (req, res) =>
  success(res, 201, 'Projet cree.', await workspaceService.createProject(req.user.userId, req.body))
);

exports.updateProject = wrap(async (req, res) =>
  success(res, 200, 'Projet mis a jour.', await workspaceService.updateProject(req.user.userId, req.params.id, req.body))
);

exports.submitProject = wrap(async (req, res) =>
  success(res, 200, 'Projet soumis pour validation.', await workspaceService.submitProject(req.user.userId, req.params.id))
);

exports.deleteProject = wrap(async (req, res) =>
  success(res, 200, 'Projet supprime.', await workspaceService.deleteProject(req.user.userId, req.params.id))
);

exports.uploadProjectMedia = wrap(async (req, res) => {
  const files = [
    ...(req.files?.screenshots || []).map((file) => ({ file, mediaType: 'SCREENSHOT' })),
    ...(req.files?.attachments || []).map((file) => ({ file, mediaType: 'ATTACHMENT' })),
  ];

  const uploaded = [];
  for (const item of files) {
    const uploadedFile = await fileService.uploadFile({
      user: req.user,
      file: item.file,
      payload: {
        entityType: 'PROJECT',
        entityId: req.params.id,
        purpose: item.mediaType === 'SCREENSHOT' ? 'PROJECT_SCREENSHOT' : 'PROJECT_ATTACHMENT',
      },
    });
    uploaded.push(
      await workspaceService.addProjectMediaRecord(
        req.user.userId,
        req.params.id,
        uploadedFile,
        item.mediaType
      )
    );
  }

  return success(res, 201, 'Medias projet ajoutes.', uploaded);
});

exports.deleteProjectMedia = wrap(async (req, res) =>
  success(
    res,
    200,
    'Media projet supprime.',
    await workspaceService.deleteProjectMedia(req.user.userId, req.params.id, req.params.mediaId)
  )
);
