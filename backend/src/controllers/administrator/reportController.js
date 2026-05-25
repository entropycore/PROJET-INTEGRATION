'use strict';

const administratorService = require('../../services/administratorService');
const { success, error } = require('../../utils/apiResponse');
const {
  VALID_ACCOUNT_STATUSES,
  VALID_USER_ROLES,
  VALID_VALIDATION_STATUSES,
  VALID_VALIDATION_TYPES,
  VALID_NOTIFICATION_TYPES,
  VALID_REPORT_STATUSES,
  VALID_REPORT_TARGET_TYPES,
  parseBooleanFilter,
  parsePositiveInt,
  normalizeRole,
  normalizeStatus,
  normalizeItemType,
  handleAdminError,
} = require('./shared');

exports.listReports = async (req, res, next) => {
  try {
    const requestedStatus = normalizeStatus(req.query.status || 'PENDING');
    const status =
      requestedStatus === 'ALL'
        ? null
        : requestedStatus === 'RESOLVED'
          ? 'APPROVED'
          : requestedStatus;
    const targetType = normalizeItemType(req.query.targetType || req.query.type);

    if (status && !VALID_REPORT_STATUSES.has(status)) {
      return error(res, 400, 'Le filtre status est invalide.');
    }

    if (targetType && targetType !== 'ALL' && !VALID_REPORT_TARGET_TYPES.has(targetType)) {
      return error(res, 400, 'Le filtre targetType est invalide.');
    }

    const data = await administratorService.listReports({
      status,
      targetType: targetType === 'ALL' ? null : targetType,
      search: req.query.search?.trim(),
      page: parsePositiveInt(req.query.page, 1),
      limit: parsePositiveInt(req.query.limit, 10),
    });

    return success(res, 200, 'Signalements recuperes.', data);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.getPendingReportsCount = async (_req, res, next) => {
  try {
    const result = await administratorService.getPendingReportsCount();
    return success(res, 200, 'Nombre de signalements en attente recupere.', result);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.getReportById = async (req, res, next) => {
  try {
    const report = await administratorService.getReportById(req.params.reportId);
    return success(res, 200, 'Signalement recupere.', report);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.resolveReport = async (req, res, next) => {
  try {
    const report = await administratorService.approveReport(
      req.params.reportId,
      req.user.roleId,
      typeof req.body?.resolutionNote === 'string'
        ? req.body.resolutionNote.trim() || null
        : typeof req.body?.comment === 'string'
          ? req.body.comment.trim() || null
          : 'Signalement marque comme traite.'
    );

    return success(res, 200, 'Signalement traite.', report);
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
      typeof req.body?.resolutionNote === 'string'
        ? req.body.resolutionNote.trim() || null
        : typeof req.body?.comment === 'string'
          ? req.body.comment.trim() || null
          : null
    );

    return success(res, 200, 'Signalement approuve.', report);
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
      typeof req.body?.resolutionNote === 'string'
        ? req.body.resolutionNote.trim() || null
        : typeof req.body?.reason === 'string'
          ? req.body.reason.trim() || null
          : typeof req.body?.comment === 'string'
            ? req.body.comment.trim() || null
            : null
    );

    return success(res, 200, 'Signalement rejete.', report);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.deleteReportedTarget = async (req, res, next) => {
  try {
    const report = await administratorService.deleteReportedTarget(
      req.params.reportId,
      req.user.roleId
    );

    return success(res, 200, 'Contenu signale traite.', report);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};
