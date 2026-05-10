'use strict';

const prisma = require('../config/prisma');
const logger = require('../logs/logger');

const isStructureMissingError = (err) => err?.code === 'P2021' || err?.code === 'P2022';

const findExistingNotification = async ({
  administratorId = null,
  type,
  title,
  relatedType = null,
  relatedId = null,
}) =>
  prisma.notification.findFirst({
    where: {
      administratorId,
      type,
      title,
      relatedType,
      relatedId,
    },
    select: { id: true },
  });

const createNotification = async ({
  administratorId = null,
  type,
  title,
  message,
  relatedType = null,
  relatedId = null,
}) => {
  try {
    const existing = await findExistingNotification({
      administratorId,
      type,
      title,
      relatedType,
      relatedId,
    });

    if (existing) {
      return existing;
    }

    return await prisma.notification.create({
      data: {
        administratorId,
        type,
        title,
        message,
        relatedType,
        relatedId,
      },
    });
  } catch (err) {
    if (isStructureMissingError(err)) {
      return null;
    }

    logger.warn({
      message: 'Creation de notification ignoree',
      error: err.message,
      type,
      title,
      relatedType,
      relatedId,
    });

    return null;
  }
};

const buildPendingItemNotificationPayload = (item) => {
  switch (item.type) {
    case 'ACCESS_REQUEST':
      return {
        type: 'ACCESS_REQUEST',
        title: "Nouvelle demande d'acces",
        message: `Une nouvelle demande d'acces professionnel a ete soumise par ${item.requesterName}.`,
        relatedType: 'ACCESS_REQUEST',
        relatedId: item.id,
      };

    case 'CERTIFICATE_VALIDATION':
    case 'RECOMMENDATION_LETTER_VALIDATION':
    case 'COMMENT_VALIDATION':
    case 'RECOMMENDATION_VALIDATION':
      return {
        type: item.type,
        title: 'Nouvelle validation a traiter',
        message: `${item.label} en attente de traitement pour ${item.requesterName}.`,
        relatedType: item.type,
        relatedId: item.id,
      };

    case 'REPORT':
      return {
        type: 'REPORT',
        title: 'Nouveau signalement',
        message: `Un nouveau signalement a ete soumis${
          item.requesterName ? ` par ${item.requesterName}` : ''
        }.`,
        relatedType: 'REPORT',
        relatedId: item.id,
      };

    default:
      return null;
  }
};

exports.ensurePendingItemNotification = async (item) => {
  if (!item || item.status !== 'PENDING') {
    return null;
  }

  const payload = buildPendingItemNotificationPayload(item);
  if (!payload) {
    return null;
  }

  return createNotification(payload);
};

exports.createAccessRequestNotification = async (user) =>
  createNotification({
    type: 'ACCESS_REQUEST',
    title: "Nouvelle demande d'acces",
    message: `Une nouvelle demande d'acces professionnel a ete soumise par ${user.firstName} ${user.lastName}.`,
    relatedType: 'ACCESS_REQUEST',
    relatedId: user.id,
  });

exports.createAdminActionNotification = async ({
  title,
  message,
  relatedType = null,
  relatedId = null,
}) =>
  createNotification({
    type: 'SYSTEM',
    title,
    message,
    relatedType,
    relatedId,
  });
