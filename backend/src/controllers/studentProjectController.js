'use strict';

const studentProjectService = require('../services/studentProjectService');
const studentProjectMediaService = require('../services/studentProjectMediaService');
const { success, error } = require('../utils/apiResponse');

const handleProjectError = (res, err) => {
  if (err.message === 'STUDENT_PROFILE_NOT_FOUND') {
    return error(res, 404, 'Profil étudiant introuvable.');
  }

  if (err.message === 'PROJECT_NOT_FOUND') {
    return error(res, 404, 'Projet introuvable.');
  }

  if (err.message === 'INVALID_PROJECT_TYPE') {
    return error(res, 400, 'Type de projet invalide.');
  }

  if (err.message === 'PROJECT_VALIDATOR_NOT_FOUND') {
    return error(res, 400, 'Aucun validateur professeur disponible pour ce projet.');
  }

  if (err.message === 'PROJECT_MEDIA_NOT_FOUND') {
    return error(res, 404, 'Média du projet introuvable.');
  }

  if (err.message === 'PROJECT_MEDIA_FILE_NOT_FOUND') {
    return error(res, 404, 'Fichier du projet introuvable.');
  }

  if (err.message === 'PROJECT_MEDIA_UPLOAD_EMPTY') {
    return error(res, 400, 'Ajoutez au moins un fichier projet.');
  }

  return null;
};

exports.listProjects = async (req, res, next) => {
  try {
    const projects = await studentProjectService.listProjects(req.user.userId);
    return success(res, 200, 'Projets étudiants chargés.', projects);
  } catch (err) {
    if (handleProjectError(res, err)) return;
    next(err);
  }
};

exports.getProjectById = async (req, res, next) => {
  try {
    const project = await studentProjectService.getProjectById(req.user.userId, req.params.projectId);
    return success(res, 200, 'Projet étudiant chargé.', project);
  } catch (err) {
    if (handleProjectError(res, err)) return;
    next(err);
  }
};

exports.createProject = async (req, res, next) => {
  try {
    const project = await studentProjectService.createProject(req.user.userId, req.body);
    return success(res, 201, 'Projet étudiant créé.', project);
  } catch (err) {
    if (handleProjectError(res, err)) return;
    next(err);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const project = await studentProjectService.updateProject(req.user.userId, req.params.projectId, req.body);
    return success(res, 200, 'Projet étudiant mis à jour.', project);
  } catch (err) {
    if (handleProjectError(res, err)) return;
    next(err);
  }
};

exports.submitProject = async (req, res, next) => {
  try {
    const project = await studentProjectService.submitProject(req.user.userId, req.params.projectId);
    return success(res, 200, 'Projet soumis à la validation.', project);
  } catch (err) {
    if (handleProjectError(res, err)) return;
    next(err);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const result = await studentProjectService.deleteProject(req.user.userId, req.params.projectId);
    return success(res, 200, 'Projet supprimé.', result);
  } catch (err) {
    if (handleProjectError(res, err)) return;
    next(err);
  }
};

exports.uploadProjectMedia = async (req, res, next) => {
  try {
    await studentProjectMediaService.uploadProjectMedia(
      req.user.userId,
      req.params.projectId,
      req.files,
    );
    const project = await studentProjectService.getProjectById(
      req.user.userId,
      req.params.projectId,
    );
    return success(res, 201, 'Fichiers du projet ajoutés.', project);
  } catch (err) {
    if (handleProjectError(res, err)) return;
    next(err);
  }
};

exports.getProjectMediaContent = async (req, res, next) => {
  try {
    const media = await studentProjectMediaService.getProjectMediaFile(
      req.user,
      req.params.projectId,
      req.params.mediaId,
    );

    res.type(media.mimeType);
    return res.sendFile(media.absolutePath, (err) => {
      if (err) next(err);
    });
  } catch (err) {
    if (handleProjectError(res, err)) return;
    next(err);
  }
};

exports.downloadProjectMedia = async (req, res, next) => {
  try {
    const media = await studentProjectMediaService.getProjectMediaFile(
      req.user,
      req.params.projectId,
      req.params.mediaId,
    );

    return res.download(media.absolutePath, media.downloadName, (err) => {
      if (err) next(err);
    });
  } catch (err) {
    if (handleProjectError(res, err)) return;
    next(err);
  }
};

exports.deleteProjectMedia = async (req, res, next) => {
  try {
    const result = await studentProjectMediaService.deleteProjectMedia(
      req.user.userId,
      req.params.projectId,
      req.params.mediaId,
    );
    return success(res, 200, 'Fichier du projet supprimé.', result);
  } catch (err) {
    if (handleProjectError(res, err)) return;
    next(err);
  }
};
