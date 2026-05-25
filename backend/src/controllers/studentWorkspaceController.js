'use strict';

const workspaceService = require('../services/studentWorkspaceService');
const fileService = require('../services/fileService');
const { success, error } = require('../utils/apiResponse');

const handleWorkspaceError = (res, err) => {
  if (!err.status) return false;
  return error(res, err.status, err.message);
};

const wrap = (handler) => async (req, res, next) => {
  try {
    return await handler(req, res, next);
  } catch (err) {
    if (handleWorkspaceError(res, err)) return null;
    return next(err);
  }
};

exports.listValidators = wrap(async (_req, res) =>
  success(res, 200, 'Validateurs recuperes.', await workspaceService.listValidators())
);

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

exports.getPortfolioPreview = wrap(async (req, res) =>
  success(res, 200, 'Portfolio recupere.', await workspaceService.getPortfolioPreview(req.user.userId))
);

exports.generatePortfolio = wrap(async (req, res) =>
  success(res, 200, 'Portfolio genere.', await workspaceService.generatePortfolio(req.user.userId, req.body))
);

exports.getPublicPortfolio = wrap(async (req, res) =>
  success(res, 200, 'Portfolio public recupere.', await workspaceService.getPublicPortfolio(req.params.slug))
);

exports.getStudentMe = wrap(async (req, res) =>
  success(res, 200, 'Profil etudiant recupere.', await workspaceService.getStudentProfile(req.user.userId))
);

exports.updateStudentMe = wrap(async (req, res) =>
  success(res, 200, 'Profil etudiant mis a jour.', await workspaceService.updateStudentProfile(req.user.userId, req.body))
);

exports.listAcademicPaths = wrap(async (req, res) =>
  success(res, 200, 'Parcours academiques recuperes.', await workspaceService.listAcademicPaths(req.user.userId))
);

exports.createAcademicPath = wrap(async (req, res) =>
  success(res, 201, 'Parcours academique cree.', await workspaceService.createAcademicPath(req.user.userId, req.body))
);

exports.updateAcademicPath = wrap(async (req, res) =>
  success(res, 200, 'Parcours academique mis a jour.', await workspaceService.updateAcademicPath(req.user.userId, req.params.id, req.body))
);

exports.deleteAcademicPath = wrap(async (req, res) =>
  success(res, 200, 'Parcours academique supprime.', await workspaceService.deleteAcademicPath(req.user.userId, req.params.id))
);

exports.listSkillsCatalog = wrap(async (req, res) =>
  success(res, 200, 'Catalogue des competences recupere.', await workspaceService.listSkillsCatalog(req.query.search || ''))
);

exports.listStudentSkills = wrap(async (req, res) =>
  success(res, 200, 'Competences recuperees.', await workspaceService.listStudentSkills(req.user.userId))
);

exports.listSoftSkills = wrap(async (req, res) =>
  success(res, 200, 'Soft skills recuperees.', await workspaceService.listStudentSkills(req.user.userId, 'SOFT_SKILL'))
);

exports.addStudentSkill = wrap(async (req, res) =>
  success(res, 201, 'Competence ajoutee.', await workspaceService.addStudentSkill(req.user.userId, req.body))
);

exports.addSoftSkill = wrap(async (req, res) =>
  success(res, 201, 'Soft skill ajoutee.', await workspaceService.addStudentSkill(req.user.userId, req.body, 'SOFT_SKILL'))
);

exports.deleteStudentSkill = wrap(async (req, res) =>
  success(res, 200, 'Competence supprimee.', await workspaceService.deleteStudentSkill(req.user.userId, req.params.id))
);

exports.getSkillStats = wrap(async (req, res) =>
  success(res, 200, 'Statistiques competences recuperees.', await workspaceService.getSkillStats(req.user.userId))
);

exports.getCareerGoal = wrap(async (req, res) =>
  success(res, 200, 'Objectif de carriere recupere.', await workspaceService.getCareerGoal(req.user.userId))
);

exports.updateCareerGoal = wrap(async (req, res) =>
  success(res, 200, 'Objectif de carriere mis a jour.', await workspaceService.updateCareerGoal(req.user.userId, req.body))
);

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
