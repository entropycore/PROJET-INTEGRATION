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

exports.listNotifications = async (req, res, next) => {
  try {
    const type = normalizeItemType(req.query.type);
    const isRead = parseBooleanFilter(req.query.isRead);

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

    return success(res, 200, 'Notifications recuperees.', data);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.markNotificationAsRead = async (req, res, next) => {
  try {
    const notification = await administratorService.markNotificationAsRead(
      req.params.notificationId,
      req.user.roleId
    );

    return success(res, 200, 'Notification marquee comme lue.', notification);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const result = await administratorService.markAllNotificationsAsRead(req.user.roleId);

    return success(res, 200, 'Toutes les notifications ont ete marquees comme lues.', result);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.getUnreadNotificationsCount = async (req, res, next) => {
  try {
    const result = await administratorService.getUnreadNotificationsCount(req.user.roleId);

    return success(res, 200, 'Nombre de notifications non lues recupere.', result);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const result = await administratorService.deleteNotification(
      req.params.notificationId,
      req.user.roleId
    );

    return success(res, 200, 'Notification supprimee.', result);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};
