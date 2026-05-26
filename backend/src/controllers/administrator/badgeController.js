'use strict';

const administratorService = require('../../services/administratorService');
const { handleAdminError, parsePositiveInt } = require('../administratorHelpers');
const { success } = require('../../utils/apiResponse');

exports.listBadges = async (req, res, next) => {
  try {
    const data = await administratorService.listBadges({
      search: req.query.search?.trim(),
      page: parsePositiveInt(req.query.page, 1),
      limit: parsePositiveInt(req.query.limit, 10),
    });
    return success(res, 200, 'Badges récupérés.', data);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.createBadge = async (req, res, next) => {
  try {
    const badge = await administratorService.createBadge(req.body || {});
    return success(res, 201, 'Badge créé.', badge);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.updateBadge = async (req, res, next) => {
  try {
    const badge = await administratorService.updateBadge(req.params.badgeId, req.body || {});
    return success(res, 200, 'Badge mis à jour.', badge);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.deleteBadge = async (req, res, next) => {
  try {
    const result = await administratorService.deleteBadge(req.params.badgeId);
    return success(res, 200, 'Badge supprimé.', result);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};
