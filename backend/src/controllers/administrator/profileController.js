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

exports.getProfile = async (req, res, next) => {
  try {
    const profile = await administratorService.getAdministratorProfile(req.user.userId);
    return success(res, 200, 'Profil administrateur charge.', profile);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};
