'use strict';

const studentNotificationService = require('../../services/student/notificationService');
const { handleStudentError } = require('../studentHelpers');
const { success } = require('../../utils/apiResponse');

exports.getUnreadNotifications = async (req, res, next) => {
  try {
    const notifications = await studentNotificationService.getUnreadStudentNotifications(
      req.user.userId,
    );
    return success(res, 200, 'Notifications non lues chargées.', notifications);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.listNotifications = async (req, res, next) => {
  try {
    const notifications = await studentNotificationService.listStudentNotifications(
      req.user.userId,
      req.query,
    );
    return success(res, 200, 'Notifications étudiantes chargées.', notifications);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getUnreadNotificationsCount = async (req, res, next) => {
  try {
    const count = await studentNotificationService.getStudentUnreadNotificationCount(
      req.user.userId,
    );
    return success(res, 200, 'Compteur de notifications chargé.', count);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.markNotificationAsRead = async (req, res, next) => {
  try {
    const notification = await studentNotificationService.markStudentNotificationAsRead(
      req.user.userId,
      req.params.notificationId,
    );
    return success(res, 200, 'Notification marquée comme lue.', notification);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const result = await studentNotificationService.markAllStudentNotificationsAsRead(
      req.user.userId,
    );
    return success(res, 200, 'Toutes les notifications ont été marquées comme lues.', result);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const result = await studentNotificationService.deleteStudentNotification(
      req.user.userId,
      req.params.notificationId,
    );
    return success(res, 200, 'Notification supprimée.', result);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};
