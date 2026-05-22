'use strict';

const prisma = require('../../config/prisma');
const notificationService = require('../notificationService');
const {
  formatFullName,
  mapCertificateRequestDetail,
  mapCommentValidationItem,
  mapDashboardCertificateRequest,
  mapInternshipValidationItem,
  mapProjectValidationItem,
  mapRecommendationLetterValidationItem,
  mapRecommendationValidationItem,
  mapValidationItemToLegacyShape,
} = require('./mappers');
const { normalizeSearch, paginateItems, readTextValue } = require('./serviceUtils');
const {
  ensureValidLegacyValidationType,
  ensureValidValidationType,
  getCertificateRequestOrThrow,
  getCommentValidationOrThrow,
  getInternshipValidationOrThrow,
  getPendingValidationCounts,
  getProjectValidationOrThrow,
  getRecommendationLetterValidationOrThrow,
  getRecommendationValidationOrThrow,
  getValidationCertificateOrThrow,
  loadCertificateValidationItems,
  loadCommentValidationItems,
  loadInternshipValidationItems,
  loadProjectValidationItems,
  loadRecommendationLetterValidationItems,
  loadRecommendationValidationItems,
  mapLegacyPendingValidationCounts,
  normalizeLegacyValidationType,
  normalizeValidationType,
  resolveValidationItemTypeById,
} = require('./validationData');

const matchesValidationSearch = (item, search) => {
  const normalizedSearch = normalizeSearch(search);
  if (!normalizedSearch) return true;

  const values = [
    item.requesterName,
    item.email,
    item.label,
    item.organization,
    item.raw?.title,
    item.raw?.activityTitle,
    item.raw?.portfolioTitle,
    item.raw?.authorName,
    item.raw?.studentName,
    item.raw?.reason,
    item.raw?.description,
    item.raw?.targetType,
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  return values.some((value) => value.includes(normalizedSearch));
};

const syncPendingValidationNotifications = async () => {
  const [certificates, letters, comments, recommendations] = await Promise.all([
    loadCertificateValidationItems('PENDING'),
    loadRecommendationLetterValidationItems('PENDING'),
    loadCommentValidationItems('PENDING'),
    loadRecommendationValidationItems('PENDING'),
  ]);

  const items = [
    ...certificates.map(mapDashboardCertificateRequest),
    ...letters.map(mapRecommendationLetterValidationItem),
    ...comments.map(mapCommentValidationItem),
    ...recommendations.map(mapRecommendationValidationItem),
  ];

  await Promise.all(items.map((item) => notificationService.ensurePendingItemNotification(item)));
};

const approveProjectValidation = async (projectId, feedback = null) => {
  const project = await getProjectValidationOrThrow(projectId);
  if (project.validationStatus !== 'PENDING') throw new Error('VALIDATION_ITEM_INVALID_STATE');

  await prisma.project.update({
    where: { id: projectId },
    data: {
      validationStatus: 'APPROVED',
      generalFeedback: feedback,
    },
  });

  return mapProjectValidationItem(await getProjectValidationOrThrow(projectId));
};

const rejectProjectValidation = async (projectId, feedback = null) => {
  const project = await getProjectValidationOrThrow(projectId);
  if (project.validationStatus !== 'PENDING') throw new Error('VALIDATION_ITEM_INVALID_STATE');

  await prisma.project.update({
    where: { id: projectId },
    data: {
      validationStatus: 'REJECTED',
      generalFeedback: feedback,
    },
  });

  return mapProjectValidationItem(await getProjectValidationOrThrow(projectId));
};

const requestProjectValidationChanges = async (projectId, feedback = null) => {
  const project = await getProjectValidationOrThrow(projectId);
  if (project.validationStatus !== 'PENDING') throw new Error('VALIDATION_ITEM_INVALID_STATE');

  await prisma.project.update({
    where: { id: projectId },
    data: {
      validationStatus: 'CHANGES_REQUESTED',
      generalFeedback: feedback,
    },
  });

  return mapProjectValidationItem(await getProjectValidationOrThrow(projectId));
};

const updateInternshipValidation = async (internshipId, validationStatus) => {
  const internship = await getInternshipValidationOrThrow(internshipId);
  if (internship.validationStatus !== 'PENDING') throw new Error('VALIDATION_ITEM_INVALID_STATE');

  await prisma.internship.update({
    where: { id: internshipId },
    data: { validationStatus },
  });

  return mapInternshipValidationItem(await getInternshipValidationOrThrow(internshipId));
};

const createCertificateValidation = async (certificateId, administratorId, decision, comment = null) => {
  const getCertificate =
    decision === 'CHANGES_REQUESTED'
      ? getValidationCertificateOrThrow
      : getCertificateRequestOrThrow;
  const certificate = await getCertificate(certificateId);
  if (certificate.validationStatus !== 'PENDING') throw new Error('VALIDATION_ITEM_INVALID_STATE');

  await prisma.$transaction(async (tx) => {
    await tx.certificate.update({
      where: { id: certificateId },
      data: { validationStatus: decision },
    });
    await tx.certificateValidation.create({
      data: {
        certificateId,
        administratorId,
        decision,
        comment,
      },
    });
  });

  const updatedCertificate = await getCertificate(certificateId);
  const titleByDecision = {
    APPROVED: 'Validation approuvée',
    REJECTED: 'Validation rejetée',
    CHANGES_REQUESTED: 'Correction demandée',
  };
  const studentName = updatedCertificate.activity?.student?.user
    ? formatFullName(updatedCertificate.activity.student.user)
    : 'un étudiant';
  const message =
    decision === 'CHANGES_REQUESTED'
      ? `Une correction a été demandée pour le certificat de ${studentName}.`
      : `La validation du certificat de ${studentName} ${
          decision === 'APPROVED' ? 'a été approuvée.' : 'a été rejetée.'
        }`;

  await notificationService.createAdminActionNotification({
    title: titleByDecision[decision],
    message,
    relatedType: 'CERTIFICATE_VALIDATION',
    relatedId: certificateId,
  });

  return mapCertificateRequestDetail(updatedCertificate);
};

const updateRecommendationLetter = async (letterId, actorUserId, validationStatus, rejectionReason = null) => {
  const letter = await getRecommendationLetterValidationOrThrow(letterId);
  if (letter.validationStatus !== 'PENDING') throw new Error('VALIDATION_ITEM_INVALID_STATE');

  await prisma.recommendationLetter.update({
    where: { id: letterId },
    data: {
      validationStatus,
      validatorUserId: actorUserId,
      validatedAt: new Date(),
      rejectionReason,
    },
  });

  const updatedLetter = await getRecommendationLetterValidationOrThrow(letterId);
  return {
    item: mapRecommendationLetterValidationItem(updatedLetter),
    owner: updatedLetter.student?.user ? formatFullName(updatedLetter.student.user) : 'un étudiant',
  };
};

const updateComment = async (commentId, actorUserId, status, rejectionReason = null) => {
  const comment = await getCommentValidationOrThrow(commentId);
  if (comment.status !== 'PENDING') throw new Error('VALIDATION_ITEM_INVALID_STATE');

  await prisma.comment.update({
    where: { id: commentId },
    data: {
      status,
      validatorUserId: actorUserId,
      validatedAt: new Date(),
      rejectionReason,
    },
  });

  const updatedComment = await getCommentValidationOrThrow(commentId);
  return {
    item: mapCommentValidationItem(updatedComment),
    owner: updatedComment.authorUser ? formatFullName(updatedComment.authorUser) : 'un utilisateur',
  };
};

const updateRecommendation = async (recommendationId, actorUserId, status, rejectionReason = null) => {
  const recommendation = await getRecommendationValidationOrThrow(recommendationId);
  if (recommendation.status !== 'PENDING') throw new Error('VALIDATION_ITEM_INVALID_STATE');

  await prisma.recommendation.update({
    where: { id: recommendationId },
    data: {
      status,
      validatorUserId: actorUserId,
      validatedAt: new Date(),
      rejectionReason,
    },
  });

  const updatedRecommendation = await getRecommendationValidationOrThrow(recommendationId);
  return {
    item: mapRecommendationValidationItem(updatedRecommendation),
    owner: updatedRecommendation.authorUser
      ? formatFullName(updatedRecommendation.authorUser)
      : 'un utilisateur',
  };
};

const sendValidationActionNotification = async ({ title, message, relatedType, relatedId }) =>
  notificationService.createAdminActionNotification({
    title,
    message,
    relatedType,
    relatedId,
  });

const approveValidationItem = async (itemType, itemId, actorUserId, administratorId, payload = {}) => {
  const type = normalizeValidationType(itemType);
  ensureValidValidationType(type);

  switch (type) {
    case 'PROJECT':
      return approveProjectValidation(itemId, readTextValue(payload, ['comment']));
    case 'INTERNSHIP':
      return updateInternshipValidation(itemId, 'APPROVED');
    case 'CERTIFICATE_VALIDATION':
      try {
        return await createCertificateValidation(
          itemId,
          administratorId,
          'APPROVED',
          readTextValue(payload, ['comment']),
        );
      } catch (err) {
        if (err.message === 'DASHBOARD_ITEM_NOT_FOUND') {
          throw new Error('VALIDATION_ITEM_NOT_FOUND', { cause: err });
        }
        throw err;
      }
    case 'RECOMMENDATION_LETTER_VALIDATION': {
      const updated = await updateRecommendationLetter(itemId, actorUserId, 'APPROVED', null);
      await sendValidationActionNotification({
        title: 'Validation approuvée',
        message: `La lettre de recommandation de ${updated.owner} a été approuvée.`,
        relatedType: type,
        relatedId: itemId,
      });
      return updated.item;
    }
    case 'COMMENT_VALIDATION': {
      const updated = await updateComment(itemId, actorUserId, 'APPROVED', null);
      await sendValidationActionNotification({
        title: 'Validation approuvée',
        message: `Le commentaire de ${updated.owner} a été approuvé.`,
        relatedType: type,
        relatedId: itemId,
      });
      return updated.item;
    }
    case 'RECOMMENDATION_VALIDATION': {
      const updated = await updateRecommendation(itemId, actorUserId, 'APPROVED', null);
      await sendValidationActionNotification({
        title: 'Validation approuvée',
        message: `La recommandation de ${updated.owner} a été approuvée.`,
        relatedType: type,
        relatedId: itemId,
      });
      return updated.item;
    }
    default:
      throw new Error('UNSUPPORTED_VALIDATION_TYPE');
  }
};

const rejectValidationItem = async (itemType, itemId, actorUserId, administratorId, payload = {}) => {
  const type = normalizeValidationType(itemType);
  ensureValidValidationType(type);
  const reason = readTextValue(payload, ['comment', 'rejectionReason', 'reason']);

  switch (type) {
    case 'PROJECT':
      return rejectProjectValidation(itemId, reason);
    case 'INTERNSHIP':
      return updateInternshipValidation(itemId, 'REJECTED');
    case 'CERTIFICATE_VALIDATION':
      try {
        return await createCertificateValidation(itemId, administratorId, 'REJECTED', reason);
      } catch (err) {
        if (err.message === 'DASHBOARD_ITEM_NOT_FOUND') {
          throw new Error('VALIDATION_ITEM_NOT_FOUND', { cause: err });
        }
        throw err;
      }
    case 'RECOMMENDATION_LETTER_VALIDATION': {
      const updated = await updateRecommendationLetter(itemId, actorUserId, 'REJECTED', reason);
      await sendValidationActionNotification({
        title: 'Validation rejetée',
        message: `La lettre de recommandation de ${updated.owner} a été rejetée.`,
        relatedType: type,
        relatedId: itemId,
      });
      return updated.item;
    }
    case 'COMMENT_VALIDATION': {
      const updated = await updateComment(itemId, actorUserId, 'REJECTED', reason);
      await sendValidationActionNotification({
        title: 'Validation rejetée',
        message: `Le commentaire de ${updated.owner} a été rejeté.`,
        relatedType: type,
        relatedId: itemId,
      });
      return updated.item;
    }
    case 'RECOMMENDATION_VALIDATION': {
      const updated = await updateRecommendation(itemId, actorUserId, 'REJECTED', reason);
      await sendValidationActionNotification({
        title: 'Validation rejetée',
        message: `La recommandation de ${updated.owner} a été rejetée.`,
        relatedType: type,
        relatedId: itemId,
      });
      return updated.item;
    }
    default:
      throw new Error('UNSUPPORTED_VALIDATION_TYPE');
  }
};

const requestValidationChangesItem = async (
  itemType,
  itemId,
  actorUserId,
  administratorId,
  payload = {},
) => {
  const type = normalizeValidationType(itemType);
  ensureValidValidationType(type);
  const comment = readTextValue(payload, ['comment', 'rejectionReason', 'reason']);

  switch (type) {
    case 'PROJECT':
      return requestProjectValidationChanges(itemId, comment);
    case 'INTERNSHIP':
      return updateInternshipValidation(itemId, 'CHANGES_REQUESTED');
    case 'CERTIFICATE_VALIDATION':
      return createCertificateValidation(itemId, administratorId, 'CHANGES_REQUESTED', comment);
    case 'RECOMMENDATION_LETTER_VALIDATION': {
      const updated = await updateRecommendationLetter(itemId, actorUserId, 'CHANGES_REQUESTED', comment);
      await sendValidationActionNotification({
        title: 'Correction demandée',
        message: `Une correction a été demandée pour la lettre de recommandation de ${updated.owner}.`,
        relatedType: type,
        relatedId: itemId,
      });
      return updated.item;
    }
    case 'COMMENT_VALIDATION': {
      const updated = await updateComment(itemId, actorUserId, 'CHANGES_REQUESTED', comment);
      await sendValidationActionNotification({
        title: 'Correction demandée',
        message: `Une correction a été demandée pour le commentaire de ${updated.owner}.`,
        relatedType: type,
        relatedId: itemId,
      });
      return updated.item;
    }
    case 'RECOMMENDATION_VALIDATION': {
      const updated = await updateRecommendation(itemId, actorUserId, 'CHANGES_REQUESTED', comment);
      await sendValidationActionNotification({
        title: 'Correction demandée',
        message: `Une correction a été demandée pour la recommandation de ${updated.owner}.`,
        relatedType: type,
        relatedId: itemId,
      });
      return updated.item;
    }
    default:
      throw new Error('UNSUPPORTED_VALIDATION_TYPE');
  }
};

const buildValidationItems = async ({ type, status = 'PENDING', search } = {}) => {
  await syncPendingValidationNotifications();

  const normalizedType = type ? normalizeValidationType(type) : null;
  if (normalizedType) {
    ensureValidValidationType(normalizedType);
  }

  const loaders = [];

  if (!normalizedType || normalizedType === 'PROJECT') {
    loaders.push(loadProjectValidationItems(status).then((items) => items.map(mapProjectValidationItem)));
  }

  if (!normalizedType || normalizedType === 'INTERNSHIP') {
    loaders.push(loadInternshipValidationItems(status).then((items) => items.map(mapInternshipValidationItem)));
  }

  if (!normalizedType || normalizedType === 'CERTIFICATE_VALIDATION') {
    loaders.push(loadCertificateValidationItems(status).then((items) => items.map(mapCertificateRequestDetail)));
  }

  if (!normalizedType || normalizedType === 'RECOMMENDATION_LETTER_VALIDATION') {
    loaders.push(
      loadRecommendationLetterValidationItems(status).then((items) =>
        items.map(mapRecommendationLetterValidationItem),
      ),
    );
  }

  if (!normalizedType || normalizedType === 'COMMENT_VALIDATION') {
    loaders.push(loadCommentValidationItems(status).then((items) => items.map(mapCommentValidationItem)));
  }

  if (!normalizedType || normalizedType === 'RECOMMENDATION_VALIDATION') {
    loaders.push(loadRecommendationValidationItems(status).then((items) => items.map(mapRecommendationValidationItem)));
  }

  const items = (await Promise.all(loaders))
    .flat()
    .filter((item) => matchesValidationSearch(item, search))
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

  return {
    type: normalizedType,
    items,
  };
};

const listValidationItems = async ({ type, status = 'PENDING', page = 1, limit = 10, search } = {}) => {
  const result = await buildValidationItems({ type, status, search });

  return {
    filters: {
      type: result.type,
      status,
      search: search || null,
    },
    ...paginateItems(result.items, page, limit),
  };
};

const listPendingValidationsLegacy = async ({
  type,
  status = 'PENDING',
  page = 1,
  limit = 10,
  search,
} = {}) => {
  const legacyType = type ? normalizeLegacyValidationType(type) : null;

  if (legacyType) {
    ensureValidLegacyValidationType(legacyType);
  }

  if (legacyType === 'PROJECT' || legacyType === 'INTERNSHIP') {
    const result = await buildValidationItems({
      type: legacyType,
      status,
      search,
    });

    return {
      filters: {
        type: legacyType,
        status,
        search: search || null,
      },
      ...paginateItems(result.items.map(mapValidationItemToLegacyShape), page, limit),
    };
  }

  const mappedType = legacyType === 'CERTIFICATE' ? 'CERTIFICATE_VALIDATION' : null;
  const result = await buildValidationItems({
    type: mappedType,
    status,
    search,
  });
  const items = result.items
    .map(mapValidationItemToLegacyShape)
    .filter((item) => !legacyType || item.targetType === legacyType);

  return {
    filters: {
      type: legacyType,
      status,
      search: search || null,
    },
    ...paginateItems(items, page, limit),
  };
};

const getPendingValidationCountsLegacy = async () =>
  mapLegacyPendingValidationCounts(await getPendingValidationCounts());

const getValidationItemDetail = async (itemType, itemId) => {
  const type = normalizeValidationType(itemType);
  ensureValidValidationType(type);

  switch (type) {
    case 'PROJECT':
      return mapProjectValidationItem(await getProjectValidationOrThrow(itemId));
    case 'INTERNSHIP':
      return mapInternshipValidationItem(await getInternshipValidationOrThrow(itemId));
    case 'CERTIFICATE_VALIDATION':
      return mapCertificateRequestDetail(await getValidationCertificateOrThrow(itemId));
    case 'RECOMMENDATION_LETTER_VALIDATION':
      return mapRecommendationLetterValidationItem(await getRecommendationLetterValidationOrThrow(itemId));
    case 'COMMENT_VALIDATION':
      return mapCommentValidationItem(await getCommentValidationOrThrow(itemId));
    case 'RECOMMENDATION_VALIDATION':
      return mapRecommendationValidationItem(await getRecommendationValidationOrThrow(itemId));
    default:
      throw new Error('UNSUPPORTED_VALIDATION_TYPE');
  }
};

const getLegacyValidationDetail = async (itemId) => {
  const type = await resolveValidationItemTypeById(itemId);
  return mapValidationItemToLegacyShape(await getValidationItemDetail(type, itemId));
};

const approveLegacyValidationItem = async (
  itemId,
  actorUserId,
  administratorId,
  payload = {},
) => {
  const type = await resolveValidationItemTypeById(itemId);
  return approveValidationItem(type, itemId, actorUserId, administratorId, payload);
};

const rejectLegacyValidationItem = async (
  itemId,
  actorUserId,
  administratorId,
  payload = {},
) => {
  const type = await resolveValidationItemTypeById(itemId);
  return rejectValidationItem(type, itemId, actorUserId, administratorId, payload);
};

const requestLegacyValidationChanges = async (
  itemId,
  actorUserId,
  administratorId,
  payload = {},
) => {
  const type = await resolveValidationItemTypeById(itemId);
  const updatedItem = await requestValidationChangesItem(
    type,
    itemId,
    actorUserId,
    administratorId,
    payload,
  );

  return mapValidationItemToLegacyShape(updatedItem);
};

module.exports = {
  approveLegacyValidationItem,
  approveValidationItem,
  createCertificateValidation,
  getCertificateRequestOrThrow,
  getLegacyValidationDetail,
  getPendingValidationCounts,
  getPendingValidationCountsLegacy,
  getValidationItemDetail,
  listPendingValidationsLegacy,
  listValidationItems,
  rejectLegacyValidationItem,
  rejectValidationItem,
  requestLegacyValidationChanges,
  requestValidationChangesItem,
  syncPendingValidationNotifications,
};
