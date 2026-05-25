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

exports.listBadges = async (req, res, next) => {
  try {
    const badges = await administratorService.listBadges({
      search: req.query.search?.trim(),
    });
    return success(res, 200, 'Badges recuperes.', badges);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.createBadge = async (req, res, next) => {
  try {
    const badge = await administratorService.createBadge(req.body || {});
    return success(res, 201, 'Badge cree.', badge);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.updateBadge = async (req, res, next) => {
  try {
    const badge = await administratorService.updateBadge(req.params.badgeId, req.body || {});
    return success(res, 200, 'Badge mis a jour.', badge);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.deleteBadge = async (req, res, next) => {
  try {
    const result = await administratorService.deleteBadge(req.params.badgeId);
    return success(res, 200, 'Badge supprime.', result);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};
