'use strict';

const {
  buildDashboardNotifications,
  computeDashboardStats,
  toStudentNotificationType,
} = require('./dashboardHelpers');
const { getStudentDashboardBaseOrThrow } = require('./studentData');

const buildNotifications = async (userId) => {
  const student = await getStudentDashboardBaseOrThrow(userId);
  const stats = await computeDashboardStats(student);

  return {
    student,
    items: buildDashboardNotifications(stats),
  };
};

const getUnreadStudentNotifications = async (userId) => {
  const { student, items } = await buildNotifications(userId);
  const unreadItems = items.filter((notification) => !notification.read);

  return {
    items: unreadItems,
    count: unreadItems.length,
    studentId: student.id,
  };
};

const listStudentNotifications = async (userId, filters = {}) => {
  const { student, items: builtItems } = await buildNotifications(userId);
  let items = builtItems.map((notification) => ({
    ...notification,
    type: toStudentNotificationType(notification.type),
  }));

  if (filters.read === 'true') {
    items = items.filter((notification) => notification.read);
  }

  if (filters.read === 'false') {
    items = items.filter((notification) => !notification.read);
  }

  if (filters.type && filters.type !== 'ALL') {
    items = items.filter((notification) => notification.type === filters.type);
  }

  return {
    items,
    summary: {
      total: items.length,
      unread: items.filter((notification) => !notification.read).length,
      read: items.filter((notification) => notification.read).length,
    },
    studentId: student.id,
  };
};

const getStudentUnreadNotificationCount = async (userId) => {
  const notifications = await listStudentNotifications(userId);
  return {
    count: notifications.summary.unread,
  };
};

const markStudentNotificationAsRead = async (userId, notificationId) => {
  const notifications = await listStudentNotifications(userId);
  const notification = notifications.items.find((item) => item.id === notificationId);

  if (!notification) {
    throw new Error('STUDENT_NOTIFICATION_NOT_FOUND');
  }

  return {
    ...notification,
    read: true,
  };
};

const markAllStudentNotificationsAsRead = async (userId) => {
  const notifications = await listStudentNotifications(userId);

  return {
    markedCount: notifications.items.length,
  };
};

const deleteStudentNotification = async (userId, notificationId) => {
  const notifications = await listStudentNotifications(userId);
  const notification = notifications.items.find((item) => item.id === notificationId);

  if (!notification) {
    throw new Error('STUDENT_NOTIFICATION_NOT_FOUND');
  }

  return {
    deleted: true,
    id: notificationId,
  };
};

module.exports = {
  deleteStudentNotification,
  getStudentUnreadNotificationCount,
  getUnreadStudentNotifications,
  listStudentNotifications,
  markAllStudentNotificationsAsRead,
  markStudentNotificationAsRead,
};
