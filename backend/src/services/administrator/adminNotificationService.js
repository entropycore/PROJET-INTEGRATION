'use strict';

const prisma = require('../../config/prisma');
const notificationService = require('../notificationService');
const { mapDashboardAccessRequest, mapNotificationItem } = require('./mappers');
const { notificationSelect } = require('./serviceSelects');
const {
  buildPagination,
  isStructureMissingError,
  normalizePagination,
  safeCount,
  safeReadWithFallback,
} = require('./serviceUtils');
const { getRecentProfessionalRequests } = require('./professionalRequestService');
const { syncPendingReportNotifications } = require('./reportService');
const { syncPendingValidationNotifications } = require('./validationService');

const NOTIFICATION_TYPES = [
  'ACCESS_REQUEST',
  'CERTIFICATE_VALIDATION',
  'RECOMMENDATION_LETTER_VALIDATION',
  'COMMENT_VALIDATION',
  'RECOMMENDATION_VALIDATION',
  'REPORT',
  'SYSTEM',
];
const LEGACY_NOTIFICATION_TYPES = ['INFO', 'VALIDATION', 'ALERT'];

const normalizeNotificationType = (value) =>
  typeof value === 'string' ? value.trim().toUpperCase().replace(/-/g, '_') : value;

const ensureValidNotificationType = (type) => {
  if (!NOTIFICATION_TYPES.includes(type) && !LEGACY_NOTIFICATION_TYPES.includes(type)) {
    throw new Error('INVALID_NOTIFICATION_TYPE');
  }
};

const getNotificationFilterByType = (type) => {
  switch (type) {
    case 'INFO':
      return { in: ['ACCESS_REQUEST', 'SYSTEM'] };
    case 'VALIDATION':
      return {
        in: [
          'CERTIFICATE_VALIDATION',
          'RECOMMENDATION_LETTER_VALIDATION',
          'COMMENT_VALIDATION',
          'RECOMMENDATION_VALIDATION',
        ],
      };
    case 'ALERT':
      return { in: ['REPORT'] };
    default:
      return type;
  }
};

const syncPendingAccessRequestNotifications = async () => {
  const requests = await getRecentProfessionalRequests(100);
  await Promise.all(
    requests.map((request) =>
      notificationService.ensurePendingItemNotification(mapDashboardAccessRequest(request)),
    ),
  );
};

const syncAdminNotifications = async () => {
  await Promise.all([
    syncPendingAccessRequestNotifications(),
    syncPendingValidationNotifications(),
    syncPendingReportNotifications(),
  ]);
};

const getNotificationOrThrow = async (notificationId, administratorId = null) => {
  const scopeConditions = administratorId
    ? [{ OR: [{ administratorId }, { administratorId: null }] }, { userId: null }]
    : [{ userId: null }];
  const notification = await safeReadWithFallback(
    () =>
      prisma.notification.findFirst({
        where: {
          id: notificationId,
          ...(scopeConditions.length ? { AND: scopeConditions } : {}),
        },
        select: notificationSelect,
      }),
    null,
    null,
  );

  if (!notification) {
    throw new Error('NOTIFICATION_NOT_FOUND');
  }

  return notification;
};

const listNotifications = async ({ administratorId, type, isRead, page = 1, limit = 10, search } = {}) => {
  await syncAdminNotifications();

  const normalizedType = type ? normalizeNotificationType(type) : null;
  if (normalizedType) {
    ensureValidNotificationType(normalizedType);
  }

  const { skip, page: safePage, limit: safeLimit } = normalizePagination(page, limit);
  const normalizedSearch = String(search || '').trim();
  const scopeConditions = administratorId
    ? [{ OR: [{ administratorId }, { administratorId: null }] }, { userId: null }]
    : [{ administratorId: null }, { userId: null }];

  const where = {
    ...(normalizedType ? { type: getNotificationFilterByType(normalizedType) } : {}),
    ...(typeof isRead === 'boolean' ? { isRead } : {}),
    ...(scopeConditions.length || normalizedSearch
      ? {
          AND: [
            ...scopeConditions,
            ...(normalizedSearch
              ? [
                  {
                    OR: [
                      { title: { contains: normalizedSearch, mode: 'insensitive' } },
                      { message: { contains: normalizedSearch, mode: 'insensitive' } },
                      { relatedType: { contains: normalizedSearch, mode: 'insensitive' } },
                    ],
                  },
                ]
              : []),
          ],
        }
      : {}),
  };

  const [total, unreadCount, allCount, notifications] = await Promise.all([
    safeCount(() => prisma.notification.count({ where })),
    safeCount(() =>
      prisma.notification.count({
        where: {
          ...(scopeConditions.length ? { AND: scopeConditions } : {}),
          isRead: false,
        },
      }),
    ),
    safeCount(() =>
      prisma.notification.count({
        where: scopeConditions.length ? { AND: scopeConditions } : undefined,
      }),
    ),
    safeReadWithFallback(
      () =>
        prisma.notification.findMany({
          where,
          orderBy: [{ createdAt: 'desc' }],
          skip,
          take: safeLimit,
          select: notificationSelect,
        }),
      null,
      [],
    ),
  ]);

  return {
    filters: {
      type: normalizedType,
      isRead: typeof isRead === 'boolean' ? isRead : null,
      search: normalizedSearch || null,
    },
    summary: {
      total: allCount,
      unread: unreadCount,
      read: Math.max(0, allCount - unreadCount),
    },
    items: notifications.map(mapNotificationItem),
    pagination: buildPagination(safePage, safeLimit, total),
  };
};

const getUnreadNotificationsCount = async (administratorId) => {
  const scopeConditions = administratorId
    ? [{ OR: [{ administratorId }, { administratorId: null }] }, { userId: null }]
    : [{ administratorId: null }, { userId: null }];

  return safeCount(() =>
    prisma.notification.count({
      where: {
        isRead: false,
        ...(scopeConditions.length ? { AND: scopeConditions } : {}),
      },
    }),
  );
};

const markNotificationAsRead = async (notificationId, administratorId) => {
  await getNotificationOrThrow(notificationId, administratorId);

  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  } catch (err) {
    if (isStructureMissingError(err)) {
      throw new Error('NOTIFICATION_NOT_FOUND', { cause: err });
    }

    throw err;
  }

  return mapNotificationItem(await getNotificationOrThrow(notificationId, administratorId));
};

const deleteNotification = async (notificationId, administratorId) => {
  await getNotificationOrThrow(notificationId, administratorId);

  try {
    await prisma.notification.delete({ where: { id: notificationId } });
  } catch (err) {
    if (isStructureMissingError(err) || err?.code === 'P2025') {
      throw new Error('NOTIFICATION_NOT_FOUND', { cause: err });
    }

    throw err;
  }

  return {
    id: notificationId,
    deleted: true,
  };
};

const markAllNotificationsAsRead = async (administratorId) => {
  const scopeConditions = administratorId
    ? [{ OR: [{ administratorId }, { administratorId: null }] }]
    : [{ administratorId: null }];
  const now = new Date();

  try {
    const result = await prisma.notification.updateMany({
      where: {
        isRead: false,
        ...(scopeConditions.length ? { AND: scopeConditions } : {}),
      },
      data: {
        isRead: true,
        readAt: now,
      },
    });

    return {
      updatedCount: result.count,
      readAt: now,
    };
  } catch (err) {
    if (isStructureMissingError(err)) {
      return {
        updatedCount: 0,
        readAt: now,
      };
    }

    throw err;
  }
};

module.exports = {
  deleteNotification,
  getUnreadNotificationsCount,
  listNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  syncAdminNotifications,
};
