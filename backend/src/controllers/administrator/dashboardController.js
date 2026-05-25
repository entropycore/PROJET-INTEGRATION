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

exports.getDashboard = async (req, res, next) => {
  try {
    const dashboard = await administratorService.getDashboardData();
    const dashboardData = dashboard && typeof dashboard === 'object' && !Array.isArray(dashboard)
      ? dashboard
      : {};

    return success(res, 200, 'Tableau de bord administrateur charge.', {
      area: 'administrator',
      user: req.user,
      ...dashboardData,
    });
  } catch (err) {
    next(err);
  }
};

exports.getDashboardItemDetail = async (req, res, next) => {
  try {
    const item = await administratorService.getDashboardItemDetail(
      req.params.itemType,
      req.params.itemId
    );

    return success(res, 200, 'Element du dashboard recupere.', item);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.approveDashboardItem = async (req, res, next) => {
  try {
    const item = await administratorService.approveDashboardItem(
      req.params.itemType,
      req.params.itemId,
      req.user.roleId,
      req.body || {}
    );

    return success(res, 200, 'Element du dashboard approuve.', item);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.rejectDashboardItem = async (req, res, next) => {
  try {
    const item = await administratorService.rejectDashboardItem(
      req.params.itemType,
      req.params.itemId,
      req.user.roleId,
      req.body || {}
    );

    return success(res, 200, 'Element du dashboard rejete.', item);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};
