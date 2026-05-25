'use strict';

const {
  workspaceService,
  fileService,
  success,
  error,
  wrap,
} = require('./shared');

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
