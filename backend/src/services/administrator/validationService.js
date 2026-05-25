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

exports.getPendingValidationCounts = getPendingValidationCounts;

exports.getValidationTypeById = async (itemId) => {
  const [
    certificate,
    recommendationLetter,
    comment,
    recommendation,
  ] = await Promise.all([
    safeReadWithFallback(
      () => prisma.certificate.findUnique({ where: { id: itemId }, select: { id: true } }),
      null,
      null
    ),
    safeReadWithFallback(
      () => prisma.recommendationLetter.findUnique({ where: { id: itemId }, select: { id: true } }),
      null,
      null
    ),
    safeReadWithFallback(
      () => prisma.comment.findUnique({ where: { id: itemId }, select: { id: true } }),
      null,
      null
    ),
    safeReadWithFallback(
      () => prisma.recommendation.findUnique({ where: { id: itemId }, select: { id: true } }),
      null,
      null
    ),
  ]);

  if (certificate) return 'CERTIFICATE_VALIDATION';
  if (recommendationLetter) return 'RECOMMENDATION_LETTER_VALIDATION';
  if (comment) return 'COMMENT_VALIDATION';
  if (recommendation) return 'RECOMMENDATION_VALIDATION';

  throw new Error('VALIDATION_ITEM_NOT_FOUND');
};

exports.listValidationItems = async ({ type, status = 'PENDING', page = 1, limit = 10, search } = {}) => {
  await syncPendingValidationNotifications();

  const normalizedType = type ? normalizeValidationType(type) : null;

  if (normalizedType) {
    ensureValidValidationType(normalizedType);
  }

  const loaders = [];

  if (!normalizedType || normalizedType === 'CERTIFICATE_VALIDATION') {
    loaders.push(loadCertificateValidationItems(status).then((items) => items.map(mapCertificateRequestDetail)));
  }

  if (!normalizedType || normalizedType === 'RECOMMENDATION_LETTER_VALIDATION') {
    loaders.push(
      loadRecommendationLetterValidationItems(status).then((items) =>
        items.map(mapRecommendationLetterValidationItem)
      )
    );
  }

  if (!normalizedType || normalizedType === 'COMMENT_VALIDATION') {
    loaders.push(loadCommentValidationItems(status).then((items) => items.map(mapCommentValidationItem)));
  }

  if (!normalizedType || normalizedType === 'RECOMMENDATION_VALIDATION') {
    loaders.push(
      loadRecommendationValidationItems(status).then((items) =>
        items.map(mapRecommendationValidationItem)
      )
    );
  }

  const mergedItems = (await Promise.all(loaders))
    .flat()
    .filter((item) => matchesValidationSearch(item, search))
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

  const paginated = paginateItems(mergedItems, page, limit);

  return {
    filters: {
      type: normalizedType,
      status,
      search: search || null,
    },
    ...paginated,
  };
};

exports.getValidationItemDetail = async (itemType, itemId) => {
  const normalizedType = normalizeValidationType(itemType);
  ensureValidValidationType(normalizedType);

  switch (normalizedType) {
    case 'CERTIFICATE_VALIDATION':
      return mapCertificateRequestDetail(await getValidationCertificateOrThrow(itemId));

    case 'RECOMMENDATION_LETTER_VALIDATION':
      return mapRecommendationLetterValidationItem(
        await getRecommendationLetterValidationOrThrow(itemId)
      );

    case 'COMMENT_VALIDATION':
      return mapCommentValidationItem(await getCommentValidationOrThrow(itemId));

    case 'RECOMMENDATION_VALIDATION':
      return mapRecommendationValidationItem(await getRecommendationValidationOrThrow(itemId));

    default:
      throw new Error('UNSUPPORTED_VALIDATION_TYPE');
  }
};

exports.approveValidationItem = async (
  itemType,
  itemId,
  actorUserId,
  administratorId,
  payload = {}
) => {
  const normalizedType = normalizeValidationType(itemType);
  ensureValidValidationType(normalizedType);

  switch (normalizedType) {
    case 'CERTIFICATE_VALIDATION':
      try {
        return await approveCertificateRequest(
          itemId,
          administratorId,
          typeof payload.comment === 'string' ? payload.comment.trim() || null : null
        );
      } catch (err) {
        if (err.message === 'DASHBOARD_ITEM_NOT_FOUND') {
          throw new Error('VALIDATION_ITEM_NOT_FOUND');
        }

        throw err;
      }

    case 'RECOMMENDATION_LETTER_VALIDATION':
      return approveRecommendationLetterValidation(itemId, actorUserId);

    case 'COMMENT_VALIDATION':
      return approveCommentValidation(itemId, actorUserId);

    case 'RECOMMENDATION_VALIDATION':
      return approveRecommendationValidation(itemId, actorUserId);

    default:
      throw new Error('UNSUPPORTED_VALIDATION_TYPE');
  }
};

exports.rejectValidationItem = async (
  itemType,
  itemId,
  actorUserId,
  administratorId,
  payload = {}
) => {
  const normalizedType = normalizeValidationType(itemType);
  ensureValidValidationType(normalizedType);

  const normalizedReason =
    typeof payload.comment === 'string'
      ? payload.comment.trim() || null
      : typeof payload.rejectionReason === 'string'
        ? payload.rejectionReason.trim() || null
        : typeof payload.reason === 'string'
          ? payload.reason.trim() || null
          : null;

  switch (normalizedType) {
    case 'CERTIFICATE_VALIDATION':
      try {
        return await rejectCertificateRequest(itemId, administratorId, normalizedReason);
      } catch (err) {
        if (err.message === 'DASHBOARD_ITEM_NOT_FOUND') {
          throw new Error('VALIDATION_ITEM_NOT_FOUND');
        }

        throw err;
      }

    case 'RECOMMENDATION_LETTER_VALIDATION':
      return rejectRecommendationLetterValidation(itemId, actorUserId, normalizedReason);

    case 'COMMENT_VALIDATION':
      return rejectCommentValidation(itemId, actorUserId, normalizedReason);

    case 'RECOMMENDATION_VALIDATION':
      return rejectRecommendationValidation(itemId, actorUserId, normalizedReason);

    default:
      throw new Error('UNSUPPORTED_VALIDATION_TYPE');
  }
};

exports.requestValidationChanges = async (
  itemType,
  itemId,
  actorUserId,
  administratorId,
  payload = {}
) => {
  const normalizedType = normalizeValidationType(itemType);
  ensureValidValidationType(normalizedType);

  const normalizedComment =
    typeof payload.comment === 'string'
      ? payload.comment.trim() || null
      : typeof payload.reason === 'string'
        ? payload.reason.trim() || null
        : null;

  switch (normalizedType) {
    case 'CERTIFICATE_VALIDATION':
      try {
        return await requestCertificateChanges(itemId, administratorId, normalizedComment);
      } catch (err) {
        if (err.message === 'DASHBOARD_ITEM_NOT_FOUND') {
          throw new Error('VALIDATION_ITEM_NOT_FOUND');
        }

        throw err;
      }

    case 'RECOMMENDATION_LETTER_VALIDATION':
      return requestRecommendationLetterChanges(itemId, actorUserId, normalizedComment);

    case 'COMMENT_VALIDATION':
      return requestCommentChanges(itemId, actorUserId, normalizedComment);

    case 'RECOMMENDATION_VALIDATION':
      return requestRecommendationChanges(itemId, actorUserId, normalizedComment);

    default:
      throw new Error('UNSUPPORTED_VALIDATION_TYPE');
  }
};
