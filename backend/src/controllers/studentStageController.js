'use strict';

const studentStageService = require('../services/studentStageService');
const studentStageMediaService = require('../services/studentStageMediaService');
const { success, error } = require('../utils/apiResponse');
const sendStoredFile = require('../utils/sendStoredFile');

const handleStageError = (res, err) => {
  if (err.message === 'STUDENT_PROFILE_NOT_FOUND') {
    return error(res, 404, 'Profil étudiant introuvable.');
  }

  if (err.message === 'STAGE_NOT_FOUND') {
    return error(res, 404, 'Stage introuvable.');
  }

  if (err.message === 'STAGE_REPORT_UPLOAD_EMPTY') {
    return error(res, 400, 'Ajoutez un rapport PDF.');
  }

  if (err.message === 'STAGE_IMAGE_UPLOAD_EMPTY') {
    return error(res, 400, 'Ajoutez au moins une image de stage.');
  }

  if (err.message === 'STAGE_REPORT_NOT_FOUND') {
    return error(res, 404, 'Rapport du stage introuvable.');
  }

  if (err.message === 'STAGE_IMAGE_NOT_FOUND') {
    return error(res, 404, 'Image du stage introuvable.');
  }

  if (err.message === 'STAGE_FILE_NOT_FOUND') {
    return error(res, 404, 'Fichier du stage introuvable.');
  }

  if (err.message === 'STAGE_VALIDATOR_NOT_FOUND') {
    return error(res, 400, 'Aucun validateur professeur disponible pour ce stage.');
  }

  return null;
};

exports.listStages = async (req, res, next) => {
  try {
    const stages = await studentStageService.listStages(req.user.userId);
    return success(res, 200, 'Stages étudiants chargés.', stages);
  } catch (err) {
    if (handleStageError(res, err)) return;
    next(err);
  }
};

exports.getStageById = async (req, res, next) => {
  try {
    const stage = await studentStageService.getStageById(req.user.userId, req.params.stageId);
    return success(res, 200, 'Stage étudiant chargé.', stage);
  } catch (err) {
    if (handleStageError(res, err)) return;
    next(err);
  }
};

exports.createStage = async (req, res, next) => {
  try {
    const stage = await studentStageService.createStage(req.user.userId, req.body);
    return success(res, 201, 'Stage étudiant créé.', stage);
  } catch (err) {
    if (handleStageError(res, err)) return;
    next(err);
  }
};

exports.updateStage = async (req, res, next) => {
  try {
    const stage = await studentStageService.updateStage(req.user.userId, req.params.stageId, req.body);
    return success(res, 200, 'Stage étudiant mis à jour.', stage);
  } catch (err) {
    if (handleStageError(res, err)) return;
    next(err);
  }
};

exports.deleteStage = async (req, res, next) => {
  try {
    const result = await studentStageService.deleteStage(req.user.userId, req.params.stageId);
    return success(res, 200, 'Stage supprimé.', result);
  } catch (err) {
    if (handleStageError(res, err)) return;
    next(err);
  }
};

exports.submitStageValidation = async (req, res, next) => {
  try {
    const stage = await studentStageService.submitStageValidation(req.user.userId, req.params.stageId);
    return success(res, 200, 'Stage soumis à la validation.', stage);
  } catch (err) {
    if (handleStageError(res, err)) return;
    next(err);
  }
};

exports.updateStageVisibility = async (req, res, next) => {
  try {
    const stage = await studentStageService.updateStageVisibility(
      req.user.userId,
      req.params.stageId,
      req.body.visibility,
    );
    return success(res, 200, 'Visibilité du stage mise à jour.', stage);
  } catch (err) {
    if (handleStageError(res, err)) return;
    next(err);
  }
};

exports.updateStageReport = async (req, res, next) => {
  try {
    const reportFile = req.files?.report?.[0];

    if (reportFile) {
      await studentStageMediaService.uploadStageReport(
        req.user.userId,
        req.params.stageId,
        reportFile,
      );
      const stage = await studentStageService.getStageById(req.user.userId, req.params.stageId);
      return success(res, 201, 'Rapport du stage ajouté.', stage);
    }

    const stage = await studentStageService.updateStageReport(req.user.userId, req.params.stageId, req.body);
    return success(res, 200, 'Rapport du stage mis à jour.', stage);
  } catch (err) {
    if (handleStageError(res, err)) return;
    next(err);
  }
};

exports.downloadStageReport = async (req, res, next) => {
  try {
    const report = await studentStageMediaService.getStageReportFile(
      req.user.userId,
      req.params.stageId,
    );

    return sendStoredFile(res, report, next);
  } catch (err) {
    if (handleStageError(res, err)) return;
    next(err);
  }
};

exports.uploadStageImages = async (req, res, next) => {
  try {
    await studentStageMediaService.uploadStageImages(
      req.user.userId,
      req.params.stageId,
      req.files?.images || [],
    );
    const stage = await studentStageService.getStageById(req.user.userId, req.params.stageId);
    return success(res, 201, 'Images du stage ajoutées.', stage);
  } catch (err) {
    if (handleStageError(res, err)) return;
    next(err);
  }
};

exports.getStageImageContent = async (req, res, next) => {
  try {
    const media = await studentStageMediaService.getStageImageFile(
      req.user.userId,
      req.params.stageId,
      req.params.mediaId,
    );

    return sendStoredFile(res, media, next);
  } catch (err) {
    if (handleStageError(res, err)) return;
    next(err);
  }
};

exports.deleteStageImage = async (req, res, next) => {
  try {
    const result = await studentStageMediaService.deleteStageImage(
      req.user.userId,
      req.params.stageId,
      req.params.mediaId,
    );
    return success(res, 200, 'Image du stage supprimée.', result);
  } catch (err) {
    if (handleStageError(res, err)) return;
    next(err);
  }
};

exports.getStageValidationHistory = async (req, res, next) => {
  try {
    const history = await studentStageService.getStageValidationHistory(req.user.userId, req.params.stageId);
    return success(res, 200, 'Historique de validation du stage chargé.', history);
  } catch (err) {
    if (handleStageError(res, err)) return;
    next(err);
  }
};

exports.addStageTechnologies = async (req, res, next) => {
  try {
    const stage = await studentStageService.addStageTechnologies(
      req.user.userId,
      req.params.stageId,
      req.body.technologyIds || [],
    );
    return success(res, 200, 'Technologies du stage mises à jour.', stage);
  } catch (err) {
    if (handleStageError(res, err)) return;
    next(err);
  }
};

exports.removeStageTechnology = async (req, res, next) => {
  try {
    const stage = await studentStageService.removeStageTechnology(
      req.user.userId,
      req.params.stageId,
      req.params.technologyId,
    );
    return success(res, 200, 'Technologie du stage supprimée.', stage);
  } catch (err) {
    if (handleStageError(res, err)) return;
    next(err);
  }
};
