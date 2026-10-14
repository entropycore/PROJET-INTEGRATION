'use strict';

const administratorService = require('../../services/administratorService');
const { success, error } = require('../../utils/apiResponse');
const {
  VALID_NOTIFICATION_TYPES,
  handleAdminError,
  normalizeItemType,
  parseBooleanFilter,
  parsePositiveInt,
} = require('../administratorHelpers');

exports.listNotifications = async (req, res, next) => {
  try {
    const type = normalizeItemType(req.query.type);
    const rawReadFilter = typeof req.query.isRead !== 'undefined' ? req.query.isRead : req.query.read;
    const isRead = parseBooleanFilter(rawReadFilter);

    if (type && !VALID_NOTIFICATION_TYPES.has(type)) {
      return error(res, 400, 'Le filtre type est invalide.');
    }

    if (isRead === null) {
      return error(res, 400, "Le filtre isRead doit valoir 'true' ou 'false'.");
    }

    const data = await administratorService.listNotifications({
      administratorId: req.user.roleId,
      type,
      isRead,
      search: req.query.search?.trim(),
      page: parsePositiveInt(req.query.page, 1),
      limit: parsePositiveInt(req.query.limit, 10),
    });

    return success(res, 200, 'Notifications récupérées.', data);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.getUnreadNotificationsCount = async (req, res, next) => {
  try {
    const count = await administratorService.getUnreadNotificationsCount(req.user.roleId);
    return success(res, 200, 'Compteur des notifications non lues récupéré.', { count });
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.markNotificationAsRead = async (req, res, next) => {
  try {
    const notification = await administratorService.markNotificationAsRead(
      req.params.notificationId,
      req.user.roleId,
    );
    return success(res, 200, 'Notification marquée comme lue.', notification);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const result = await administratorService.deleteNotification(
      req.params.notificationId,
      req.user.roleId,
    );
    return success(res, 200, 'Notification supprimée.', result);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const result = await administratorService.markAllNotificationsAsRead(req.user.roleId);
    return success(res, 200, 'Toutes les notifications ont été marquées comme lues.', result);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};
