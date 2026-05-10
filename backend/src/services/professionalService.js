'use strict';

const prisma = require('../config/prisma');

const professionalProfileSelect = {
  id: true,
  userId: true,
  company: true,
  jobTitle: true,
  sector: true,
  bio: true,
  isVerified: true,
  isEmailVerified: true,
  emailVerifyExpires: true,
  emailVerifiedAt: true,
  approvedAt: true,
  rejectedAt: true,
  rejectionReason: true,
  suspendedAt: true,
  suspensionReason: true,
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      profilePicture: true,
      accountStatus: true,
      createdAt: true,
      lastLoginAt: true,
    },
  },
  approvedByAdministrator: {
    select: {
      id: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  },
  rejectedByAdministrator: {
    select: {
      id: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  },
  suspendedByAdministrator: {
    select: {
      id: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  },
};

const formatFullName = (user) => `${user.firstName} ${user.lastName}`.trim();

const mapAdministratorSummary = (administrator) => {
  if (!administrator?.user) {
    return null;
  }

  return {
    id: administrator.id,
    fullName: formatFullName(administrator.user),
    email: administrator.user.email,
  };
};

const mapProfessionalProfile = (professional) => ({
  user: {
    id: professional.user.id,
    firstName: professional.user.firstName,
    lastName: professional.user.lastName,
    fullName: formatFullName(professional.user),
    email: professional.user.email,
    phone: professional.user.phone,
    profilePicture: professional.user.profilePicture,
    accountStatus: professional.user.accountStatus,
    createdAt: professional.user.createdAt,
    lastLoginAt: professional.user.lastLoginAt,
  },
  profile: {
    id: professional.id,
    userId: professional.userId,
    company: professional.company,
    jobTitle: professional.jobTitle,
    sector: professional.sector,
    bio: professional.bio,
    isVerified: professional.isVerified,
    isEmailVerified: professional.isEmailVerified,
    emailVerifyExpires: professional.emailVerifyExpires,
    emailVerifiedAt: professional.emailVerifiedAt,
    approvedAt: professional.approvedAt,
    approvedByAdministrator: mapAdministratorSummary(professional.approvedByAdministrator),
    rejectedAt: professional.rejectedAt,
    rejectedByAdministrator: mapAdministratorSummary(professional.rejectedByAdministrator),
    rejectionReason: professional.rejectionReason,
    suspendedAt: professional.suspendedAt,
    suspendedByAdministrator: mapAdministratorSummary(professional.suspendedByAdministrator),
    suspensionReason: professional.suspensionReason,
  },
});

const getProfessionalOrThrow = async (userId) => {
  const professional = await prisma.professional.findUnique({
    where: { userId },
    select: professionalProfileSelect,
  });

  if (!professional) {
    throw new Error('PROFESSIONAL_PROFILE_NOT_FOUND');
  }

  return professional;
};

exports.getProfessionalProfile = async (userId) =>
  mapProfessionalProfile(await getProfessionalOrThrow(userId));
