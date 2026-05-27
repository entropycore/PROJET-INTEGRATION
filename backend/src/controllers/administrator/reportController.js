'use strict';

const administratorService = require('../../services/administratorService');
const { success, error } = require('../../utils/apiResponse');
const {
  VALID_REPORT_STATUSES,
  VALID_REPORT_TARGET_TYPES,
  getReportStatusFilter,
  handleAdminError,
  normalizeItemType,
  parsePositiveInt,
  readBodyText,
} = require('../administratorHelpers');

exports.listReports = async (req, res, next) => {
  try {
    const status = getReportStatusFilter(req.query.status);
    const targetType = normalizeItemType(req.query.targetType || req.query.type);

    if (status && !VALID_REPORT_STATUSES.has(status)) {
      return error(res, 400, 'Le filtre status est invalide.');
    }

    if (targetType && !VALID_REPORT_TARGET_TYPES.has(targetType)) {
      return error(res, 400, 'Le filtre targetType est invalide.');
    }

    const data = await administratorService.listReports({
      status,
      targetType,
      search: req.query.search?.trim(),
      page: parsePositiveInt(req.query.page, 1),
      limit: parsePositiveInt(req.query.limit, 10),
    });

    return success(res, 200, 'Signalements récupérés.', data);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.getPendingReportsCountLegacy = async (req, res, next) => {
  try {
    const count = await administratorService.getPendingReportsCount();
    return success(res, 200, 'Compteur des signalements en attente récupéré.', { count });
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.getReportById = async (req, res, next) => {
  try {
    const report = await administratorService.getReportById(req.params.reportId);
    return success(res, 200, 'Signalement récupéré.', report);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.approveReport = async (req, res, next) => {
  try {
    const report = await administratorService.approveReport(
      req.params.reportId,
      req.user.roleId,
      readBodyText(req.body, ['resolutionNote', 'comment']),
    );
    return success(res, 200, 'Signalement approuvé.', report);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.resolveLegacyReport = async (req, res, next) => {
  try {
    const report = await administratorService.resolveReportLegacy(
      req.params.reportId,
      req.user.roleId,
      readBodyText(req.body, ['resolutionNote', 'comment']),
    );
    return success(res, 200, 'Signalement traité.', report);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.rejectReport = async (req, res, next) => {
  try {
    const report = await administratorService.rejectReport(
      req.params.reportId,
      req.user.roleId,
      readBodyText(req.body, ['resolutionNote', 'reason', 'comment']),
    );
    return success(res, 200, 'Signalement rejeté.', report);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.deleteLegacyReportedTarget = async (req, res, next) => {
  try {
    const report = await administratorService.deleteReportedTarget(
      req.params.reportId,
      req.user.roleId,
      readBodyText(req.body, ['resolutionNote', 'comment']),
    );
    return success(res, 200, 'Contenu signalé supprimé.', report);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};
