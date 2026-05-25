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

exports.listReports = async ({ status = 'PENDING', targetType, page = 1, limit = 10, search } = {}) => {
  await syncPendingReportNotifications();

  const normalizedStatus = toDatabaseReportStatus(status);
  const requestedTargetType = targetType
    ? String(targetType).trim().toUpperCase().replace(/-/g, '_')
    : null;
  const normalizedTargetType = requestedTargetType && requestedTargetType !== 'ALL'
    ? requestedTargetType
    : null;

  if (normalizedStatus) {
    ensureValidReportStatus(normalizedStatus);
  }

  if (normalizedTargetType) {
    ensureValidReportTargetType(normalizedTargetType);
  }

  const reports = await loadReportItems(normalizedStatus, normalizedTargetType);
  const filteredReports = reports
    .map(mapReportItem)
    .filter((item) => matchesValidationSearch(item, search));

  const paginated = paginateItems(filteredReports, page, limit);

  return {
    filters: {
      status: normalizedStatus,
      targetType: normalizedTargetType,
      search: search || null,
    },
    ...paginated,
  };
};

exports.getReportById = async (reportId) => mapReportItem(await getReportOrThrow(reportId));

exports.getPendingReportsCount = async () => ({
  count: await safeCount(() => prisma.report.count({ where: { status: 'PENDING' } })),
});

exports.approveReport = async (reportId, administratorId, resolutionNote = null) => {
  const report = await getReportOrThrow(reportId);

  if (report.status !== 'PENDING') {
    throw new Error('REPORT_INVALID_STATE');
  }

  await prisma.report.update({
    where: { id: reportId },
    data: {
      status: 'APPROVED',
      reviewedByAdministratorId: administratorId,
      reviewedAt: new Date(),
      resolutionNote,
    },
  });

  const updatedReport = await exports.getReportById(reportId);
  await notificationService.createAdminActionNotification({
    title: 'Signalement approuve',
    message: `Le signalement lie a ${report.targetType.toLowerCase()} a ete approuve.`,
    relatedType: 'REPORT',
    relatedId: reportId,
  });

  return updatedReport;
};

exports.rejectReport = async (reportId, administratorId, resolutionNote = null) => {
  const report = await getReportOrThrow(reportId);

  if (report.status !== 'PENDING') {
    throw new Error('REPORT_INVALID_STATE');
  }

  await prisma.report.update({
    where: { id: reportId },
    data: {
      status: 'REJECTED',
      reviewedByAdministratorId: administratorId,
      reviewedAt: new Date(),
      resolutionNote,
    },
  });

  const updatedReport = await exports.getReportById(reportId);
  await notificationService.createAdminActionNotification({
    title: 'Signalement rejete',
    message: `Le signalement lie a ${report.targetType.toLowerCase()} a ete rejete.`,
    relatedType: 'REPORT',
    relatedId: reportId,
  });

  return updatedReport;
};

exports.deleteReportedTarget = async (reportId, administratorId) => {
  const report = await getReportOrThrow(reportId);

  if (report.status !== 'PENDING') {
    throw new Error('REPORT_INVALID_STATE');
  }

  if (!report.targetId || report.targetType === 'OTHER') {
    throw new Error('REPORT_TARGET_DELETE_UNSUPPORTED');
  }

  const now = new Date();
  let targetAction = 'DELETED';

  try {
    await prisma.$transaction(async (tx) => {
      switch (report.targetType) {
        case 'COMMENT':
          await tx.comment.delete({ where: { id: report.targetId } });
          break;
        case 'RECOMMENDATION':
          await tx.recommendation.delete({ where: { id: report.targetId } });
          break;
        case 'PROJECT':
          await tx.project.delete({ where: { id: report.targetId } });
          break;
        case 'INTERNSHIP':
          await tx.internship.delete({ where: { id: report.targetId } });
          break;
        case 'PORTFOLIO':
          await tx.portfolio.delete({ where: { id: report.targetId } });
          break;
        case 'USER':
          await tx.user.update({
            where: { id: report.targetId },
            data: { accountStatus: 'SUSPENDED' },
          });
          targetAction = 'SUSPENDED';
          break;
        default:
          throw new Error('REPORT_TARGET_DELETE_UNSUPPORTED');
      }

      await tx.report.update({
        where: { id: reportId },
        data: {
          status: 'APPROVED',
          reviewedByAdministratorId: administratorId,
          reviewedAt: now,
          resolutionNote:
            targetAction === 'SUSPENDED'
              ? 'Compte utilisateur suspendu suite au signalement.'
              : 'Contenu signale supprime suite au signalement.',
        },
      });
    });
  } catch (err) {
    if (err?.code === 'P2025') {
      throw new Error('REPORT_TARGET_NOT_FOUND');
    }

    throw err;
  }

  const updatedReport = await exports.getReportById(reportId);
  await notificationService.createAdminActionNotification({
    title: 'Signalement traite',
    message:
      targetAction === 'SUSPENDED'
        ? 'Le compte signale a ete suspendu.'
        : 'Le contenu signale a ete supprime.',
    relatedType: 'REPORT',
    relatedId: reportId,
  });

  return {
    ...updatedReport,
    targetAction,
  };
};
