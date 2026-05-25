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

const getValidationTypeById = async (validationId) =>
  administratorService.getValidationTypeById(validationId);

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

    return success(res, 200, 'Validations recuperees.', data);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.listPendingValidationItems = async (req, res, next) => {
  try {
    const type = normalizeItemType(req.query.type);

    const data = await administratorService.listValidationItems({
      type: type === 'ALL' ? null : type,
      status: 'PENDING',
      search: req.query.search?.trim(),
      page: parsePositiveInt(req.query.page, 1),
      limit: parsePositiveInt(req.query.limit, 10),
    });

    return success(res, 200, 'Validations en attente recuperees.', data);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.getPendingValidationsCount = async (_req, res, next) => {
  try {
    const counts = await administratorService.getPendingValidationCounts();

    return success(res, 200, 'Nombre de validations en attente recupere.', {
      count: counts.total,
      projects: 0,
      internships: 0,
      certificates: counts.pendingCertificates,
      activities: counts.pendingCertificates,
      recommendationLetters: counts.pendingLetters,
      comments: counts.pendingComments,
      recommendations: counts.pendingRecommendations,
      raw: counts,
    });
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.getValidationItemById = async (req, res, next) => {
  try {
    const itemType = await getValidationTypeById(req.params.validationId);
    const item = await administratorService.getValidationItemDetail(itemType, req.params.validationId);

    return success(res, 200, 'Element de validation recupere.', item);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.approveValidationItemById = async (req, res, next) => {
  try {
    const itemType = await getValidationTypeById(req.params.validationId);
    const item = await administratorService.approveValidationItem(
      itemType,
      req.params.validationId,
      req.user.userId,
      req.user.roleId,
      req.body || {}
    );

    return success(res, 200, 'Validation approuvee.', item);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.rejectValidationItemById = async (req, res, next) => {
  try {
    const itemType = await getValidationTypeById(req.params.validationId);
    const item = await administratorService.rejectValidationItem(
      itemType,
      req.params.validationId,
      req.user.userId,
      req.user.roleId,
      req.body || {}
    );

    return success(res, 200, 'Validation rejetee.', item);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.requestValidationChangesById = async (req, res, next) => {
  try {
    const itemType = await getValidationTypeById(req.params.validationId);
    const item = await administratorService.requestValidationChanges(
      itemType,
      req.params.validationId,
      req.user.userId,
      req.user.roleId,
      req.body || {}
    );

    return success(res, 200, 'Correction demandee.', item);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.getValidationItemDetail = async (req, res, next) => {
  try {
    const item = await administratorService.getValidationItemDetail(
      req.params.itemType,
      req.params.itemId
    );

    return success(res, 200, 'Element de validation recupere.', item);
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
      req.body || {}
    );

    return success(res, 200, 'Validation approuvee.', item);
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
      req.body || {}
    );

    return success(res, 200, 'Validation rejetee.', item);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};
