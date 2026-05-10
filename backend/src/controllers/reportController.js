'use strict';

const reportService = require('../services/reportService');
const { success, error } = require('../utils/apiResponse');

exports.createReport = async (req, res, next) => {
  try {
    const report = await reportService.createReport({
      reporterUserId: req.user.userId,
      targetType: req.body.targetType,
      targetId: req.body.targetId,
      reason: req.body.reason,
      description: req.body.description,
    });

    return success(res, 201, 'Signalement cree.', report);
  } catch (err) {
    if (err.message === 'INVALID_REPORT_TARGET_TYPE') {
      return error(res, 400, 'Le type de cible du signalement est invalide.');
    }

    if (err.message === 'REPORT_TARGET_ID_REQUIRED') {
      return error(res, 400, "L'identifiant de la cible est obligatoire pour ce type de signalement.");
    }

    if (err.message === 'REPORT_TARGET_NOT_FOUND') {
      return error(res, 404, 'La cible du signalement est introuvable.');
    }

    if (err.message === 'REPORT_ALREADY_EXISTS') {
      return error(res, 409, 'Un signalement en attente existe deja pour cette cible.');
    }

    next(err);
  }
};
