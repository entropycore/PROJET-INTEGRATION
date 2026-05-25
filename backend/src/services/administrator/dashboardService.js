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

const professionalRequestService = require('./professionalRequestService');
const reportAdminService = require('./reportAdminService');

exports.getDashboardData = async () => {
  await syncAdminNotifications();

  const [
    totalUsers,
    totalStudents,
    totalProfessors,
    pendingRequests,
    pendingValidationCounts,
    pendingReports,
    recentRequests,
  ] = await Promise.all([
    safeCount(() => prisma.user.count()),
    safeCount(() => prisma.user.count({ where: { role: 'STUDENT' } })),
    safeCount(() => prisma.user.count({ where: { role: 'PROFESSOR' } })),
    safeCount(() =>
      prisma.user.count({
        where: {
          role: 'PROFESSIONAL',
          accountStatus: 'PENDING',
        },
      })
    ),
    getPendingValidationCounts(),
    safeCount(() => prisma.report.count({ where: { status: 'PENDING' } })),
    getRecentDashboardRequests(),
  ]);

  return {
    summaryCards: {
      totalUsers: { value: totalUsers, variation: 'Comptes enregistres' },
      totalStudents: { value: totalStudents, variation: 'Profils etudiants' },
      totalProfessors: { value: totalProfessors, variation: 'Profils professeurs' },
      pendingRequests: { value: pendingRequests, variation: 'Demandes professionnelles' },
    },
    urgentActions: {
      pendingAccessRequests: pendingRequests,
      pendingValidations: pendingValidationCounts.total,
      reports: pendingReports,
    },
    recentRequests,
  };
};

exports.getDashboardItemDetail = async (itemType, itemId) => {
  const normalizedType = String(itemType || '')
    .trim()
    .toUpperCase()
    .replace(/-/g, '_');

  switch (normalizedType) {
    case 'ACCESS_REQUEST': {
      const request = await getProfessionalRequestOrThrow(itemId);
      return mapProfessionalRequestDetail(request);
    }

    case 'CERTIFICATE_VALIDATION': {
      const certificate = await getCertificateRequestOrThrow(itemId);
      return mapCertificateRequestDetail(certificate);
    }

    case 'REPORT':
      return reportAdminService.getReportById(itemId);

    default:
      throw new Error('UNSUPPORTED_DASHBOARD_ITEM_TYPE');
  }
};

exports.approveDashboardItem = async (itemType, itemId, administratorId, payload = {}) => {
  const normalizedType = String(itemType || '')
    .trim()
    .toUpperCase()
    .replace(/-/g, '_');

  switch (normalizedType) {
    case 'ACCESS_REQUEST':
      return professionalRequestService.approveProfessionalRequest(itemId, administratorId);

    case 'CERTIFICATE_VALIDATION':
      return approveCertificateRequest(
        itemId,
        administratorId,
        typeof payload.comment === 'string' ? payload.comment.trim() || null : null
      );

    case 'REPORT':
      return reportAdminService.approveReport(
        itemId,
        administratorId,
        typeof payload.resolutionNote === 'string'
          ? payload.resolutionNote.trim() || null
          : typeof payload.comment === 'string'
            ? payload.comment.trim() || null
            : null
      );

    default:
      throw new Error('UNSUPPORTED_DASHBOARD_ACTION_TYPE');
  }
};

exports.rejectDashboardItem = async (itemType, itemId, administratorId, payload = {}) => {
  const normalizedType = String(itemType || '')
    .trim()
    .toUpperCase()
    .replace(/-/g, '_');

  const normalizedComment =
    typeof payload.comment === 'string'
      ? payload.comment.trim() || null
      : typeof payload.rejectionReason === 'string'
        ? payload.rejectionReason.trim() || null
        : typeof payload.reason === 'string'
          ? payload.reason.trim() || null
          : null;

  switch (normalizedType) {
    case 'ACCESS_REQUEST':
      return professionalRequestService.rejectProfessionalRequest(itemId, administratorId, normalizedComment);

    case 'CERTIFICATE_VALIDATION':
      return rejectCertificateRequest(itemId, administratorId, normalizedComment);

    case 'REPORT':
      return reportAdminService.rejectReport(itemId, administratorId, normalizedComment);

    default:
      throw new Error('UNSUPPORTED_DASHBOARD_ACTION_TYPE');
  }
};
