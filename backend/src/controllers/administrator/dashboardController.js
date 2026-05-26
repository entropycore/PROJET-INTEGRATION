'use strict';

const administratorService = require('../../services/administratorService');
const { handleAdminError } = require('../administratorHelpers');
const { success } = require('../../utils/apiResponse');

exports.getDashboard = async (req, res, next) => {
  try {
    const dashboard = await administratorService.getDashboardData();
    return success(res, 200, 'Tableau de bord administrateur chargé.', dashboard);
  } catch (err) {
    next(err);
  }
};

exports.getDashboardItemDetail = async (req, res, next) => {
  try {
    const item = await administratorService.getDashboardItemDetail(
      req.params.itemType,
      req.params.itemId,
    );

    return success(res, 200, 'Élément du dashboard récupéré.', item);
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
      req.body || {},
    );

    return success(res, 200, 'Élément du dashboard approuvé.', item);
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
      req.body || {},
    );

    return success(res, 200, 'Élément du dashboard rejeté.', item);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};
