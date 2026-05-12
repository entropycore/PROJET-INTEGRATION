'use strict';

const studentStageService = require('../services/studentStageService');
const { success, error } = require('../utils/apiResponse');

const handleStageError = (res, err) => {
  if (err.message === 'STUDENT_PROFILE_NOT_FOUND') {
    return error(res, 404, 'Profil etudiant introuvable.');
  }

  if (err.message === 'STAGE_NOT_FOUND') {
    return error(res, 404, 'Stage introuvable.');
  }

  return null;
};

exports.listStages = async (req, res, next) => {
  try {
    const stages = await studentStageService.listStages(req.user.userId);
    return success(res, 200, 'Stages etudiants charges.', stages);
  } catch (err) {
    if (handleStageError(res, err)) return;
    next(err);
  }
};

exports.getStageById = async (req, res, next) => {
  try {
    const stage = await studentStageService.getStageById(req.user.userId, req.params.stageId);
    return success(res, 200, 'Stage etudiant charge.', stage);
  } catch (err) {
    if (handleStageError(res, err)) return;
    next(err);
  }
};

exports.createStage = async (req, res, next) => {
  try {
    const stage = await studentStageService.createStage(req.user.userId, req.body);
    return success(res, 201, 'Stage etudiant cree.', stage);
  } catch (err) {
    if (handleStageError(res, err)) return;
    next(err);
  }
};

exports.updateStage = async (req, res, next) => {
  try {
    const stage = await studentStageService.updateStage(req.user.userId, req.params.stageId, req.body);
    return success(res, 200, 'Stage etudiant mis a jour.', stage);
  } catch (err) {
    if (handleStageError(res, err)) return;
    next(err);
  }
};

exports.deleteStage = async (req, res, next) => {
  try {
    const result = await studentStageService.deleteStage(req.user.userId, req.params.stageId);
    return success(res, 200, 'Stage supprime.', result);
  } catch (err) {
    if (handleStageError(res, err)) return;
    next(err);
  }
};

exports.submitStageValidation = async (req, res, next) => {
  try {
    const stage = await studentStageService.submitStageValidation(
      req.user.userId,
      req.params.stageId,
    );
    return success(res, 200, 'Stage soumis a la validation.', stage);
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
    return success(res, 200, 'Visibilite du stage mise a jour.', stage);
  } catch (err) {
    if (handleStageError(res, err)) return;
    next(err);
  }
};

exports.updateStageReport = async (req, res, next) => {
  try {
    const stage = await studentStageService.updateStageReport(
      req.user.userId,
      req.params.stageId,
      req.body,
    );
    return success(res, 200, 'Rapport du stage mis a jour.', stage);
  } catch (err) {
    if (handleStageError(res, err)) return;
    next(err);
  }
};

exports.getStageValidationHistory = async (req, res, next) => {
  try {
    const history = await studentStageService.getStageValidationHistory(
      req.user.userId,
      req.params.stageId,
    );
    return success(res, 200, 'Historique de validation du stage charge.', history);
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
    return success(res, 200, 'Technologies du stage mises a jour.', stage);
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
    return success(res, 200, 'Technologie du stage supprimee.', stage);
  } catch (err) {
    if (handleStageError(res, err)) return;
    next(err);
  }
};
