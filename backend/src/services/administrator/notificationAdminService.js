'use strict';

const {
  bcrypt,
  crypto,
  prisma,
  notificationService,
  USER_ROLES,
  ACCOUNT_STATUSES,
  VALIDATION_ITEM_TYPES,
  NOTIFICATION_TYPES,
  REPORT_STATUSES,
  REPORT_TARGET_TYPES,
  BCRYPT_ROUNDS,
  isStructureMissingError,
  safeCount,
  safeAggregateCount,
  safeReadWithFallback,
  buildUserSearch,
  normalizePagination,
  buildPagination,
  normalizeValidationType,
  ensureValidValidationType,
  ensureValidNotificationType,
  ensureValidReportStatus,
  ensureValidReportTargetType,
  paginateItems,
  normalizeSearch,
  matchesValidationSearch,
  getNotificationTone,
  getNotificationLink,
  mapNotificationItem,
  buildProfessionalProfileData,
  ensureValidRole,
  ensureValidStatus,
  buildRoleCreateData,
  buildRoleUpdateData,
  stripUndefined,
  getUserOrThrow,
  certificateDetailSelect,
  getProfessionalRequestOrThrow,
  getCertificateRequestOrThrow,
  getValidationCertificateOrThrow,
  getReportOrThrow,
  getNotificationOrThrow,
  getRecommendationLetterValidationOrThrow,
  getCommentValidationOrThrow,
  getRecommendationValidationOrThrow,
  deleteCurrentProfile,
  ensureRoleChangeAllowed,
  createProfileForRole,
  buildTemporaryPassword,
  getPendingValidationCounts,
  getRecentProfessionalRequests,
  getRecentCertificateRequests,
  getRecentReportItems,
  getRecentDashboardRequests,
  syncPendingAccessRequestNotifications,
  syncPendingValidationNotifications,
  syncPendingReportNotifications,
  syncAdminNotifications,
  getProfessionalRequestsList,
  loadCertificateValidationItems,
  loadRecommendationLetterValidationItems,
  loadCommentValidationItems,
  loadRecommendationValidationItems,
  loadReportItems,
  approveCertificateRequest,
  rejectCertificateRequest,
  approveRecommendationLetterValidation,
  rejectRecommendationLetterValidation,
  approveCommentValidation,
  rejectCommentValidation,
  approveRecommendationValidation,
  rejectRecommendationValidation,
  requestCertificateChanges,
  requestRecommendationLetterChanges,
  requestCommentChanges,
  requestRecommendationChanges,
  professionalRequestSelect,
  professionalRequestLegacySelect,
  recentCertificateSelect,
  reportSelect,
  notificationSelect,
  recommendationLetterValidationSelect,
  commentValidationSelect,
  recommendationValidationSelect,
  userSelect,
  formatFullName,
  normalizeProfessionalData,
  getEmailVerifiedValue,
  mapUserSummary,
  mapProfessionalRequestDetail,
  mapDashboardAccessRequest,
  mapDashboardCertificateRequest,
  toFullName,
  mapFrontendStudent,
  mapFrontendAuthor,
  toFrontendReportStatus,
  toDatabaseReportStatus,
  mapCertificateRequestDetail,
  mapRecommendationLetterValidationItem,
  mapCommentValidationItem,
  mapRecommendationValidationItem,
  mapReportItem,
} = require('./shared');

exports.listNotifications = async ({
  administratorId,
  type,
  isRead,
  page = 1,
  limit = 10,
  search,
} = {}) => {
  await syncAdminNotifications();

  const normalizedType = type ? normalizeValidationType(type) : null;

  if (normalizedType) {
    ensureValidNotificationType(normalizedType);
  }

  const { skip, page: safePage, limit: safeLimit } = normalizePagination(page, limit);
  const normalizedSearch = String(search || '').trim();

  const scopeConditions = administratorId
    ? [{ OR: [{ administratorId }, { administratorId: null }] }]
    : [{ administratorId: null }];

  const where = {
    ...(normalizedType ? { type: normalizedType } : {}),
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
          ...(scopeConditions.length
            ? {
                AND: scopeConditions,
              }
            : {}),
          isRead: false,
        },
      })
    ),
    safeCount(() =>
      prisma.notification.count({
        where: scopeConditions.length
          ? {
              AND: scopeConditions,
            }
          : undefined,
      })
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
      []
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

exports.markNotificationAsRead = async (notificationId, administratorId) => {
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
      throw new Error('NOTIFICATION_NOT_FOUND');
    }

    throw err;
  }

  return mapNotificationItem(await getNotificationOrThrow(notificationId, administratorId));
};

exports.markAllNotificationsAsRead = async (administratorId) => {
  const scopeConditions = administratorId
    ? [{ OR: [{ administratorId }, { administratorId: null }] }]
    : [{ administratorId: null }];

  const now = new Date();

  try {
    const result = await prisma.notification.updateMany({
      where: {
        isRead: false,
        ...(scopeConditions.length
          ? {
              AND: scopeConditions,
            }
          : {}),
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

exports.getUnreadNotificationsCount = async (administratorId) => {
  const scopeConditions = administratorId
    ? [{ OR: [{ administratorId }, { administratorId: null }] }]
    : [{ administratorId: null }];

  return {
    count: await safeCount(() =>
      prisma.notification.count({
        where: {
          isRead: false,
          ...(scopeConditions.length
            ? {
                AND: scopeConditions,
              }
            : {}),
        },
      })
    ),
  };
};

exports.deleteNotification = async (notificationId, administratorId) => {
  await getNotificationOrThrow(notificationId, administratorId);

  try {
    await prisma.notification.delete({
      where: { id: notificationId },
    });
  } catch (err) {
    if (isStructureMissingError(err) || err?.code === 'P2025') {
      throw new Error('NOTIFICATION_NOT_FOUND');
    }

    throw err;
  }

  return {
    deleted: true,
    notificationId,
  };
};
