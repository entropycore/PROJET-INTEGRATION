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

const inferProfessionalState = (professional) => {
  if (professional.user.accountStatus === 'SUSPENDED' || professional.suspendedAt) {
    return 'SUSPENDED';
  }

  if (professional.rejectedAt || professional.user.accountStatus === 'INACTIVE') {
    return 'REJECTED';
  }

  if (professional.isVerified || professional.approvedAt || professional.user.accountStatus === 'ACTIVE') {
    return 'APPROVED';
  }

  return 'PENDING';
};

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

exports.getProfessionalDashboard = async (userId) => {
  const professional = await getProfessionalOrThrow(userId);

  const completionFields = [
    professional.company,
    professional.jobTitle,
    professional.sector,
    professional.bio,
    professional.user.phone,
  ];
  const completedFields = completionFields.filter((value) => Boolean(String(value || '').trim())).length;
  const profileCompletion = Math.round((completedFields / completionFields.length) * 100);
  const currentState = inferProfessionalState(professional);

  const timeline = [
    {
      type: 'ACCOUNT_CREATED',
      label: 'Compte cree',
      date: professional.user.createdAt,
      actor: null,
      details: null,
    },
    professional.emailVerifiedAt
      ? {
          type: 'EMAIL_VERIFIED',
          label: 'Email verifie',
          date: professional.emailVerifiedAt,
          actor: null,
          details: null,
        }
      : null,
    professional.approvedAt
      ? {
          type: 'ACCOUNT_APPROVED',
          label: 'Compte approuve',
          date: professional.approvedAt,
          actor: mapAdministratorSummary(professional.approvedByAdministrator),
          details: null,
        }
      : null,
    professional.rejectedAt
      ? {
          type: 'ACCOUNT_REJECTED',
          label: 'Compte rejete',
          date: professional.rejectedAt,
          actor: mapAdministratorSummary(professional.rejectedByAdministrator),
          details: professional.rejectionReason,
        }
      : null,
    professional.suspendedAt
      ? {
          type: 'ACCOUNT_SUSPENDED',
          label: 'Compte suspendu',
          date: professional.suspendedAt,
          actor: mapAdministratorSummary(professional.suspendedByAdministrator),
          details: professional.suspensionReason,
        }
      : null,
  ]
    .filter(Boolean)
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());

  return {
    profileSnapshot: {
      id: professional.user.id,
      fullName: formatFullName(professional.user),
      email: professional.user.email,
      profilePicture: professional.user.profilePicture,
      company: professional.company,
      jobTitle: professional.jobTitle,
      sector: professional.sector,
      accountStatus: professional.user.accountStatus,
      currentState,
      lastLoginAt: professional.user.lastLoginAt,
    },
    summaryCards: {
      profileCompletion: { value: profileCompletion, label: 'Profil complet (%)' },
      emailVerified: { value: professional.isEmailVerified ? 1 : 0, label: 'Email verifie' },
      adminVerified: { value: professional.isVerified ? 1 : 0, label: 'Validation admin' },
      accountSuspended: {
        value: professional.user.accountStatus === 'SUSPENDED' || professional.suspendedAt ? 1 : 0,
        label: 'Compte suspendu',
      },
    },
    accountOverview: {
      currentState,
      isEmailVerified: professional.isEmailVerified,
      emailVerifiedAt: professional.emailVerifiedAt,
      isVerified: professional.isVerified,
      approvedAt: professional.approvedAt,
      approvedByAdministrator: mapAdministratorSummary(professional.approvedByAdministrator),
      rejectedAt: professional.rejectedAt,
      rejectedByAdministrator: mapAdministratorSummary(professional.rejectedByAdministrator),
      rejectionReason: professional.rejectionReason,
      suspendedAt: professional.suspendedAt,
      suspendedByAdministrator: mapAdministratorSummary(professional.suspendedByAdministrator),
      suspensionReason: professional.suspensionReason,
    },
    timeline,
  };
};
