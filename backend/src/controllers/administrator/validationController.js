'use strict';

const administratorService = require('../../services/administratorService');
const { success, error } = require('../../utils/apiResponse');
const sendStoredFile = require('../../utils/sendStoredFile');
const {
  VALID_LEGACY_VALIDATION_TYPES,
  VALID_VALIDATION_STATUSES,
  VALID_VALIDATION_TYPES,
  handleAdminError,
  normalizeItemType,
  normalizeStatus,
  parsePositiveInt,
} = require('../administratorHelpers');

exports.listValidationItems = async (req, res, next) => {
  try {
    const type = normalizeItemType(req.query.type);
    const status = normalizeStatus(req.query.status || 'PENDING');

    if (type && !VALID_VALIDATION_TYPES.has(type)) {
      return error(res, 400, 'Le filtre type est invalide.');
    }

    if (status && !VALID_VALIDATION_STATUSES.has(status)) {
      return error(res, 400, 'Le filtre status est invalide.');
    }

    const data = await administratorService.listValidationItems({
      type,
      status,
      search: req.query.search?.trim(),
      page: parsePositiveInt(req.query.page, 1),
      limit: parsePositiveInt(req.query.limit, 10),
    });

    return success(res, 200, 'Validations récupérées.', data);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.listPendingValidationsLegacy = async (req, res, next) => {
  try {
    const type = normalizeItemType(req.query.type);
    const status = normalizeStatus(req.query.status || 'PENDING');

    if (type && !VALID_LEGACY_VALIDATION_TYPES.has(type)) {
      return error(res, 400, 'Le filtre type legacy est invalide.');
    }

    if (status && !VALID_VALIDATION_STATUSES.has(status)) {
      return error(res, 400, 'Le filtre status est invalide.');
    }

    const data = await administratorService.listPendingValidationsLegacy({
      type,
      status,
      search: req.query.search?.trim(),
      page: parsePositiveInt(req.query.page, 1),
      limit: parsePositiveInt(req.query.limit, 10),
    });

    return success(res, 200, 'Validations en attente récupérées.', data);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.getPendingValidationCountsLegacy = async (req, res, next) => {
  try {
    const data = await administratorService.getPendingValidationCountsLegacy();
    return success(res, 200, 'Compteurs des validations en attente récupérés.', data);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.getValidationItemDetail = async (req, res, next) => {
  try {
    const item = await administratorService.getValidationItemDetail(
      req.params.itemType,
      req.params.itemId,
    );
    return success(res, 200, 'Élément de validation récupéré.', item);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.getLegacyValidationDetail = async (req, res, next) => {
  try {
    const item = await administratorService.getLegacyValidationDetail(req.params.validationId);
    return success(res, 200, 'Validation récupérée.', item);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.downloadValidationFile = async (req, res, next) => {
  try {
    const file = await administratorService.getAdminValidationFile(
      req.params.itemType,
      req.params.itemId,
      req.params.fileId,
      req.params.action,
    );

    return sendStoredFile(res, file, next);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.approveValidationItem = async (req, res, next) => {
  try {
    const item = await administratorService.approveValidationItem(
      req.params.itemType,
      req.params.itemId,
      req.user.userId,
      req.user.roleId,
      req.body || {},
    );
    return success(res, 200, 'Validation approuvée.', item);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.approveLegacyValidationItem = async (req, res, next) => {
  try {
    const item = await administratorService.approveLegacyValidationItem(
      req.params.validationId,
      req.user.userId,
      req.user.roleId,
      req.body || {},
    );
    return success(res, 200, 'Validation approuvée.', item);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.rejectValidationItem = async (req, res, next) => {
  try {
    const item = await administratorService.rejectValidationItem(
      req.params.itemType,
      req.params.itemId,
      req.user.userId,
      req.user.roleId,
      req.body || {},
    );
    return success(res, 200, 'Validation rejetée.', item);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.rejectLegacyValidationItem = async (req, res, next) => {
  try {
    const item = await administratorService.rejectLegacyValidationItem(
      req.params.validationId,
      req.user.userId,
      req.user.roleId,
      req.body || {},
    );
    return success(res, 200, 'Validation rejetée.', item);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.requestLegacyValidationChanges = async (req, res, next) => {
  try {
    const item = await administratorService.requestLegacyValidationChanges(
      req.params.validationId,
      req.user.userId,
      req.user.roleId,
      req.body || {},
    );
    return success(res, 200, 'Demande de correction envoyée.', item);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};
