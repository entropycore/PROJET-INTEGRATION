'use strict';

const prisma = require('../../config/prisma');
const {
  buildDashboardNotifications,
  computeDashboardStats,
  toStudentNotificationType,
} = require('./dashboardHelpers');
const { getStudentDashboardBaseOrThrow } = require('./studentData');

const STATE_KEY = 'studentNotifications';

const asPlainObject = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {};

const normalizeState = (preferences) => {
  const rawState = asPlainObject(asPlainObject(preferences)[STATE_KEY]);

  return {
    readIds: Array.isArray(rawState.readIds) ? rawState.readIds : [],
    deletedIds: Array.isArray(rawState.deletedIds) ? rawState.deletedIds : [],
  };
};

const getUserNotificationState = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      preferences: true,
    },
  });

  if (!user) {
    throw new Error('STUDENT_PROFILE_NOT_FOUND');
  }

  return {
    preferences: asPlainObject(user.preferences),
    state: normalizeState(user.preferences),
  };
};

const saveUserNotificationState = async (userId, preferences, state) => {
  await prisma.user.update({
    where: { id: userId },
    data: {
      preferences: {
        ...preferences,
        [STATE_KEY]: {
          readIds: [...new Set(state.readIds)],
          deletedIds: [...new Set(state.deletedIds)],
        },
      },
    },
  });
};

const applyState = (items, state) => {
  const readIds = new Set(state.readIds);
  const deletedIds = new Set(state.deletedIds);

  return items
    .filter((notification) => !deletedIds.has(notification.id))
    .map((notification) => ({
      ...notification,
      read: notification.read || readIds.has(notification.id),
    }));
};

const buildNotifications = async (userId) => {
  const student = await getStudentDashboardBaseOrThrow(userId);
  const stats = await computeDashboardStats(student);
  const { preferences, state } = await getUserNotificationState(userId);

  return {
    student,
    preferences,
    state,
    items: applyState(buildDashboardNotifications(stats), state),
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
  const { preferences, state, items } = await buildNotifications(userId);
  const notification = items.find((item) => item.id === notificationId);

  if (!notification) {
    throw new Error('STUDENT_NOTIFICATION_NOT_FOUND');
  }

  const nextState = {
    ...state,
    readIds: [...state.readIds, notificationId],
  };

  await saveUserNotificationState(userId, preferences, nextState);

  return {
    ...notification,
    read: true,
  };
};

const markAllStudentNotificationsAsRead = async (userId) => {
  const { preferences, state, items } = await buildNotifications(userId);
  const nextState = {
    ...state,
    readIds: [...state.readIds, ...items.map((notification) => notification.id)],
  };

  await saveUserNotificationState(userId, preferences, nextState);

  return {
    markedCount: items.length,
  };
};

const deleteStudentNotification = async (userId, notificationId) => {
  const { preferences, state, items } = await buildNotifications(userId);
  const notification = items.find((item) => item.id === notificationId);

  if (!notification) {
    throw new Error('STUDENT_NOTIFICATION_NOT_FOUND');
  }

  const nextState = {
    ...state,
    deletedIds: [...state.deletedIds, notificationId],
  };

  await saveUserNotificationState(userId, preferences, nextState);

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
