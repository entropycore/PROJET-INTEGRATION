'use strict';

const prisma = require('../config/prisma');

const professionalRequestSelect = {
  id: true,
  role: true,
  lastName: true,
  firstName: true,
  email: true,
  accountStatus: true,
  createdAt: true,
  lastLoginAt: true,
  professional: {
    select: {
      id: true,
      company: true,
      jobTitle: true,
      sector: true,
      bio: true,
      isVerified: true,
      isEmailVerified: true,
      emailVerifyExpires: true,
    },
  },
};

const getProfessionalRequestOrThrow = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: professionalRequestSelect,
  });

  if (!user || user.role !== 'PROFESSIONAL' || !user.professional) {
    throw new Error('REQUEST_NOT_FOUND');
  }

  return user;
};

exports.listProfessionalRequests = async ({ status, emailVerified } = {}) => {
  const where = {
    role: 'PROFESSIONAL',
  };

  if (status) {
    where.accountStatus = status;
  }

  if (typeof emailVerified === 'boolean') {
    where.professional = {
      is: {
        isEmailVerified: emailVerified,
      },
    };
  }

  return prisma.user.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }],
    select: professionalRequestSelect,
  });
};

exports.getProfessionalRequest = async (userId) => {
  return getProfessionalRequestOrThrow(userId);
};

exports.approveProfessionalRequest = async (userId) => {
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

  return prisma.$transaction(async (tx) => {
    await tx.professional.update({
      where: { userId },
      data: { isVerified: true },
    });

    await tx.user.update({
      where: { id: userId },
      data: { accountStatus: 'ACTIVE' },
    });

    return tx.user.findUnique({
      where: { id: userId },
      select: professionalRequestSelect,
    });
  });
};

exports.rejectProfessionalRequest = async (userId) => {
  const request = await getProfessionalRequestOrThrow(userId);

  if (request.accountStatus !== 'PENDING') {
    throw new Error('INVALID_REQUEST_STATE');
  }

  return prisma.$transaction(async (tx) => {
    await tx.professional.update({
      where: { userId },
      data: { isVerified: false },
    });

    await tx.user.update({
      where: { id: userId },
      data: { accountStatus: 'INACTIVE' },
    });

    return tx.user.findUnique({
      where: { id: userId },
      select: professionalRequestSelect,
    });
  });
};
