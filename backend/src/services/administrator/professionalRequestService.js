'use strict';

const prisma = require('../../config/prisma');
const notificationService = require('../notificationService');
const { mapDashboardAccessRequest, mapProfessionalRequestDetail } = require('./mappers');
const {
  professionalRequestLegacySelect,
  professionalRequestSelect,
} = require('./serviceSelects');
const {
  buildPagination,
  normalizePagination,
  safeCount,
  safeReadWithFallback,
} = require('./serviceUtils');
const { buildUserSearch } = require('./userData');
const { ensureValidStatus } = require('./userHelpers');

const getProfessionalRequestOrThrow = async (userId) => {
  const user = await safeReadWithFallback(
    () =>
      prisma.user.findUnique({
        where: { id: userId },
        select: professionalRequestSelect,
      }),
    () =>
      prisma.user.findUnique({
        where: { id: userId },
        select: professionalRequestLegacySelect,
      }),
    null,
  );

  if (!user || user.role !== 'PROFESSIONAL' || !user.professional) {
    throw new Error('REQUEST_NOT_FOUND');
  }

  return user;
};

const getRecentProfessionalRequests = async (take = 5) =>
  safeReadWithFallback(
    () =>
      prisma.user.findMany({
        where: {
          role: 'PROFESSIONAL',
          accountStatus: 'PENDING',
        },
        orderBy: [{ createdAt: 'desc' }],
        take,
        select: professionalRequestSelect,
      }),
    () =>
      prisma.user.findMany({
        where: {
          role: 'PROFESSIONAL',
          accountStatus: 'PENDING',
        },
        orderBy: [{ createdAt: 'desc' }],
        take,
        select: professionalRequestLegacySelect,
      }),
    [],
  );

const getProfessionalRequestsList = async (where, skip, take) =>
  safeReadWithFallback(
    () =>
      prisma.user.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take,
        select: professionalRequestSelect,
      }),
    () =>
      prisma.user.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take,
        select: professionalRequestLegacySelect,
      }),
    [],
  );

const listProfessionalRequests = async ({ status, emailVerified, page = 1, limit = 10, search } = {}) => {
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

const getProfessionalRequest = async (userId) =>
  mapProfessionalRequestDetail(await getProfessionalRequestOrThrow(userId));

const approveProfessionalRequest = async (userId, administratorId) => {
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

  const updatedRequest = await getProfessionalRequest(userId);
  await notificationService.createAdminActionNotification({
    title: "Demande d'accès approuvée",
    message: `La demande d'accès de ${updatedRequest.requesterName} a été approuvée.`,
    relatedType: 'ACCESS_REQUEST',
    relatedId: userId,
  });

  return updatedRequest;
};

const rejectProfessionalRequest = async (userId, administratorId, rejectionReason) => {
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

  const updatedRequest = await getProfessionalRequest(userId);
  await notificationService.createAdminActionNotification({
    title: "Demande d'accès rejetée",
    message: `La demande d'accès de ${updatedRequest.requesterName} a été rejetée.`,
    relatedType: 'ACCESS_REQUEST',
    relatedId: userId,
  });

  return updatedRequest;
};

module.exports = {
  approveProfessionalRequest,
  getProfessionalRequest,
  getProfessionalRequestOrThrow,
  getRecentProfessionalRequests,
  listProfessionalRequests,
  rejectProfessionalRequest,
};
