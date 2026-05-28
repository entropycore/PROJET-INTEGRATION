'use strict';

const { success } = require('../utils/apiResponse');

const emptyNotificationPage = (page = 1, limit = 10) => ({
  filters: {
    type: null,
    isRead: null,
    search: null,
  },
  summary: {
    total: 0,
    unread: 0,
    read: 0,
  },
  items: [],
  pagination: {
    page,
    limit,
    total: 0,
    totalPages: 1,
  },
});

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < 1 ? fallback : parsed;
};

exports.listNotifications = async (req, res) =>
  success(
    res,
    200,
    'Notifications récupérées.',
    emptyNotificationPage(
      parsePositiveInt(req.query.page, 1),
      parsePositiveInt(req.query.limit, 10)
    )
  );

exports.getUnreadCount = async (_req, res) =>
  success(res, 200, 'Nombre de notifications non lues récupéré.', { count: 0 });

exports.getMyUnreadNotifications = async (_req, res) =>
  success(res, 200, 'Notifications non lues récupérées.', { count: 0, items: [] });

exports.markAsRead = async (req, res) =>
  success(res, 200, 'Notification marquée comme lue.', {
    updated: true,
    notificationId: req.params.notificationId,
  });

exports.markAllAsRead = async (_req, res) =>
  success(res, 200, 'Toutes les notifications ont été marquées comme lues.', {
    updatedCount: 0,
    readAt: new Date(),
  });

exports.deleteNotification = async (req, res) =>
  success(res, 200, 'Notification supprimée.', {
    deleted: true,
    notificationId: req.params.notificationId,
  });
