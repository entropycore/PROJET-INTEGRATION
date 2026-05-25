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

exports.listBadges = async ({ search } = {}) =>
  prisma.badge.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined,
    orderBy: { createdAt: 'desc' },
  });

exports.createBadge = async (payload) => {
  if (!payload?.name || !payload?.rule) {
    throw new Error('MISSING_REQUIRED_FIELDS');
  }

  return prisma.badge.create({
    data: {
      name: payload.name,
      description: payload.description || null,
      rule: payload.rule,
      iconUrl: payload.iconUrl || payload.icon_url || null,
      tone: payload.tone || 'blue',
    },
  });
};

exports.updateBadge = async (badgeId, payload) =>
  prisma.badge.update({
    where: { id: badgeId },
    data: {
      name: payload.name,
      description: payload.description,
      rule: payload.rule,
      iconUrl: payload.iconUrl || payload.icon_url,
      tone: payload.tone,
    },
  });

exports.deleteBadge = async (badgeId) => {
  await prisma.badge.delete({ where: { id: badgeId } });
  return { deleted: true, id: badgeId };
};
