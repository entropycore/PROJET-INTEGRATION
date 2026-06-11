'use strict';

const userNotificationService = require('../services/userNotificationService');
const { success, error } = require('../utils/apiResponse');

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < 1 ? fallback : parsed;
};

const parseReadFilter = (query) => {
  const rawValue = typeof query.isRead !== 'undefined' ? query.isRead : query.read;

  if (typeof rawValue === 'undefined' || rawValue === '') {
    return undefined;
  }

  if (rawValue === true || rawValue === 'true') {
    return true;
  }

  if (rawValue === false || rawValue === 'false') {
    return false;
  }

  return null;
};

const handleNotificationError = (res, err) => {
  if (err.message === 'USER_NOTIFICATION_NOT_FOUND') {
    return error(res, 404, 'Notification introuvable.');
  }

  if (err.message === 'USER_NOT_FOUND') {
    return error(res, 404, 'Utilisateur introuvable.');
  }

  return null;
};

exports.listNotifications = async (req, res, next) => {
  try {
    const isRead = parseReadFilter(req.query);

    if (isRead === null) {
      return error(res, 400, "Le filtre isRead doit valoir 'true' ou 'false'.");
    }

    const data = await userNotificationService.listUserNotifications(req.user.userId, {
      type: req.query.type,
      isRead,
      search: req.query.search,
      page: parsePositiveInt(req.query.page, 1),
      limit: parsePositiveInt(req.query.limit, 10),
    });

    return success(res, 200, 'Notifications recuperees.', data);
  } catch (err) {
    if (handleNotificationError(res, err)) return;
    next(err);
  }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await userNotificationService.getUnreadCount(req.user.userId);
    return success(res, 200, 'Nombre de notifications non lues recupere.', { count });
  } catch (err) {
    if (handleNotificationError(res, err)) return;
    next(err);
  }
};

exports.getMyUnreadNotifications = async (req, res, next) => {
  try {
    const notifications = await userNotificationService.getUnreadNotifications(req.user.userId);
    return success(res, 200, 'Notifications non lues recuperees.', notifications);
  } catch (err) {
    if (handleNotificationError(res, err)) return;
    next(err);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await userNotificationService.markAsRead(
      req.user.userId,
      req.params.notificationId,
    );
    return success(res, 200, 'Notification marquee comme lue.', notification);
  } catch (err) {
    if (handleNotificationError(res, err)) return;
    next(err);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    const result = await userNotificationService.markAllAsRead(req.user.userId);
    return success(res, 200, 'Toutes les notifications ont ete marquees comme lues.', result);
  } catch (err) {
    if (handleNotificationError(res, err)) return;
    next(err);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const result = await userNotificationService.deleteNotification(
      req.user.userId,
      req.params.notificationId,
    );
    return success(res, 200, 'Notification supprimee.', result);
  } catch (err) {
    if (handleNotificationError(res, err)) return;
    next(err);
  }
};
