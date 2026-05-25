'use strict';

const {
  workspaceService,
  fileService,
  success,
  error,
  wrap,
} = require('./shared');

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
