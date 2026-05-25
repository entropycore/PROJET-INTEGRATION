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

exports.listProfessionalRequests = async ({ status, emailVerified, page = 1, limit = 10, search } = {}) => {
  if (status) {
    ensureValidStatus(status);
  }

  const { skip, page: safePage, limit: safeLimit } = normalizePagination(page, limit);

  const where = {
    role: 'PROFESSIONAL',
    ...(status ? { accountStatus: status } : {}),
    ...(typeof emailVerified === 'boolean'
      ? {
          professional: {
            is: {
              isEmailVerified: emailVerified,
            },
          },
        }
      : {}),
    ...(search ? { OR: buildUserSearch(search) } : {}),
  };

  const [total, requests] = await Promise.all([
    safeCount(() => prisma.user.count({ where })),
    getProfessionalRequestsList(where, skip, safeLimit),
  ]);

  return {
    items: requests.map(mapProfessionalRequestDetail),
    pagination: buildPagination(safePage, safeLimit, total),
  };
};

exports.getProfessionalRequest = async (userId) => {
  const request = await getProfessionalRequestOrThrow(userId);
  return mapProfessionalRequestDetail(request);
};

exports.approveProfessionalRequest = async (userId, administratorId) => {
  const request = await getProfessionalRequestOrThrow(userId);

  if (!request.professional.isEmailVerified) {
    throw new Error('EMAIL_NOT_VERIFIED');
  }

  if (request.accountStatus === 'ACTIVE' && request.professional.isVerified) {
    throw new Error('REQUEST_ALREADY_APPROVED');
  }

  if (request.accountStatus !== 'PENDING') {
    throw new Error('INVALID_REQUEST_STATE');
  }

  await prisma.$transaction(async (tx) => {
    await tx.professional.update({
      where: { userId },
      data: {
        isVerified: true,
        approvedAt: new Date(),
        approvedByAdministratorId: administratorId || null,
        rejectedAt: null,
        rejectedByAdministratorId: null,
        rejectionReason: null,
        suspendedAt: null,
        suspendedByAdministratorId: null,
        suspensionReason: null,
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: { accountStatus: 'ACTIVE' },
    });
  });

  const updatedRequest = await exports.getProfessionalRequest(userId);
  await notificationService.createAdminActionNotification({
    title: "Demande d'acces approuvee",
    message: `La demande d'acces de ${updatedRequest.requesterName} a ete approuvee.`,
    relatedType: 'ACCESS_REQUEST',
    relatedId: userId,
  });

  return updatedRequest;
};

exports.rejectProfessionalRequest = async (userId, administratorId, rejectionReason) => {
  const request = await getProfessionalRequestOrThrow(userId);

  if (request.accountStatus !== 'PENDING') {
    throw new Error('INVALID_REQUEST_STATE');
  }

  await prisma.$transaction(async (tx) => {
    await tx.professional.update({
      where: { userId },
      data: {
        isVerified: false,
        approvedAt: null,
        approvedByAdministratorId: null,
        rejectedAt: new Date(),
        rejectedByAdministratorId: administratorId || null,
        rejectionReason: rejectionReason || null,
        suspendedAt: null,
        suspendedByAdministratorId: null,
        suspensionReason: null,
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: { accountStatus: 'INACTIVE' },
    });
  });

  const updatedRequest = await exports.getProfessionalRequest(userId);
  await notificationService.createAdminActionNotification({
    title: "Demande d'acces rejetee",
    message: `La demande d'acces de ${updatedRequest.requesterName} a ete rejetee.`,
    relatedType: 'ACCESS_REQUEST',
    relatedId: userId,
  });

  return updatedRequest;
};
