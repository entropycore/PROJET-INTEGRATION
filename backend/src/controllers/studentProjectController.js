'use strict';

const studentProjectService = require('../services/studentProjectService');
const { success, error } = require('../utils/apiResponse');

const handleProjectError = (res, err) => {
  if (err.message === 'STUDENT_PROFILE_NOT_FOUND') {
    return error(res, 404, 'Profil etudiant introuvable.');
  }

  if (err.message === 'PROJECT_NOT_FOUND') {
    return error(res, 404, 'Projet introuvable.');
  }

  if (err.message === 'INVALID_PROJECT_TYPE') {
    return error(res, 400, 'Type de projet invalide.');
  }

  return null;
};

exports.listProjects = async (req, res, next) => {
  try {
    const projects = await studentProjectService.listProjects(req.user.userId);
    return success(res, 200, 'Projets etudiants charges.', projects);
  } catch (err) {
    if (handleProjectError(res, err)) return;
    next(err);
  }
};

exports.getProjectById = async (req, res, next) => {
  try {
    const project = await studentProjectService.getProjectById(req.user.userId, req.params.projectId);
    return success(res, 200, 'Projet etudiant charge.', project);
  } catch (err) {
    if (handleProjectError(res, err)) return;
    next(err);
  }
};

exports.createProject = async (req, res, next) => {
  try {
    const project = await studentProjectService.createProject(req.user.userId, req.body);
    return success(res, 201, 'Projet etudiant cree.', project);
  } catch (err) {
    if (handleProjectError(res, err)) return;
    next(err);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const project = await studentProjectService.updateProject(
      req.user.userId,
      req.params.projectId,
      req.body,
    );
    return success(res, 200, 'Projet etudiant mis a jour.', project);
  } catch (err) {
    if (handleProjectError(res, err)) return;
    next(err);
  }
};

exports.submitProject = async (req, res, next) => {
  try {
    const project = await studentProjectService.submitProject(req.user.userId, req.params.projectId);
    return success(res, 200, 'Projet soumis a la validation.', project);
  } catch (err) {
    if (handleProjectError(res, err)) return;
    next(err);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const result = await studentProjectService.deleteProject(req.user.userId, req.params.projectId);
    return success(res, 200, 'Projet supprime.', result);
  } catch (err) {
    if (handleProjectError(res, err)) return;
    next(err);
  }
};
