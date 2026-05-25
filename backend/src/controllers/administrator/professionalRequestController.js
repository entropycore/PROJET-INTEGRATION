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

exports.listProfessionalRequests = async (req, res, next) => {
  try {
    const status = normalizeStatus(req.query.status || 'PENDING');
    const emailVerified = parseBooleanFilter(req.query.emailVerified);

    if (!VALID_ACCOUNT_STATUSES.has(status)) {
      return error(res, 400, 'Le filtre status est invalide.');
    }

    if (emailVerified === null) {
      return error(res, 400, "Le filtre emailVerified doit valoir 'true' ou 'false'.");
    }

    const requestsResult = await administratorService.listProfessionalRequests({
      status,
      emailVerified,
      search: req.query.search?.trim(),
      page: parsePositiveInt(req.query.page, 1),
      limit: parsePositiveInt(req.query.limit, 10),
    });
    const normalizedRequests = Array.isArray(requestsResult)
      ? { requests: requestsResult }
      : requestsResult && typeof requestsResult === 'object'
        ? requestsResult
        : { requests: [] };

    return success(res, 200, 'Demandes professionnelles recuperees.', {
      filters: { status, emailVerified },
      ...normalizedRequests,
      requests: normalizedRequests.requests || [],
    });
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.getProfessionalRequest = async (req, res, next) => {
  try {
    const request = await administratorService.getProfessionalRequest(req.params.userId);
    return success(res, 200, 'Demande professionnelle recuperee.', request);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.approveProfessionalRequest = async (req, res, next) => {
  try {
    const request = await administratorService.approveProfessionalRequest(
      req.params.userId,
      req.user.roleId
    );

    return success(res, 200, 'Demande professionnelle approuvée.', request);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.rejectProfessionalRequest = async (req, res, next) => {
  try {
    const rejectionReason =
      typeof req.body?.rejectionReason === 'string'
        ? req.body.rejectionReason.trim() || null
        : null;

    const request = await administratorService.rejectProfessionalRequest(
      req.params.userId,
      req.user.roleId,
      rejectionReason
    );

    return success(res, 200, 'Demande professionnelle rejetée.', request);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};
