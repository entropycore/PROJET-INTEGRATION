'use strict';

const administratorService = require('../../services/administratorService');
const { success, error } = require('../../utils/apiResponse');
const {
  VALID_ACCOUNT_STATUSES,
  handleAdminError,
  normalizeStatus,
  parseBooleanFilter,
  parsePositiveInt,
  readBodyText,
} = require('../administratorHelpers');

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

    const requests = await administratorService.listProfessionalRequests({
      status,
      emailVerified,
      search: req.query.search?.trim(),
      page: parsePositiveInt(req.query.page, 1),
      limit: parsePositiveInt(req.query.limit, 10),
    });

    return success(res, 200, 'Demandes professionnelles récupérées.', {
      filters: { status, emailVerified },
      ...requests,
    });
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.getProfessionalRequest = async (req, res, next) => {
  try {
    const request = await administratorService.getProfessionalRequest(req.params.userId);
    return success(res, 200, 'Demande professionnelle récupérée.', request);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.approveProfessionalRequest = async (req, res, next) => {
  try {
    const request = await administratorService.approveProfessionalRequest(
      req.params.userId,
      req.user.roleId,
    );
    return success(res, 200, 'Demande professionnelle approuvée.', request);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.rejectProfessionalRequest = async (req, res, next) => {
  try {
    const request = await administratorService.rejectProfessionalRequest(
      req.params.userId,
      req.user.roleId,
      readBodyText(req.body, ['rejectionReason']),
    );
    return success(res, 200, 'Demande professionnelle rejetée.', request);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};
