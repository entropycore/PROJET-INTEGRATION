'use strict';

const professionalRequestSelect = {
  id: true,
  role: true,
  lastName: true,
  firstName: true,
  email: true,
  phone: true,
  profilePicture: true,
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
      emailVerifiedAt: true,
      emailVerifyExpires: true,
      approvedAt: true,
      approvedByAdministratorId: true,
      rejectedAt: true,
      rejectedByAdministratorId: true,
      rejectionReason: true,
      suspendedAt: true,
      suspendedByAdministratorId: true,
      suspensionReason: true,
    },
  },
};

const professionalRequestLegacySelect = {
  id: true,
  role: true,
  lastName: true,
  firstName: true,
  email: true,
  phone: true,
  profilePicture: true,
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

const recentCertificateSelect = {
  id: true,
  validationStatus: true,
  submittedAt: true,
  documentUrl: true,
  activity: {
    select: {
      id: true,
      title: true,
      organization: true,
      student: {
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
    },
  },
};

const reportSelect = {
  id: true,
  targetType: true,
  targetId: true,
  reason: true,
  description: true,
  status: true,
  createdAt: true,
  reviewedAt: true,
  resolutionNote: true,
  reporterUser: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      profilePicture: true,
    },
  },
  reviewedByAdministrator: {
    select: {
      id: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  },
};

const notificationSelect = {
  id: true,
  administratorId: true,
  type: true,
  title: true,
  message: true,
  relatedType: true,
  relatedId: true,
  isRead: true,
  createdAt: true,
  readAt: true,
};

const badgeSelect = {
  id: true,
  name: true,
  description: true,
  rule: true,
  iconUrl: true,
  tone: true,
  createdAt: true,
  updatedAt: true,
};

const userSelect = {
  id: true,
  lastName: true,
  firstName: true,
  email: true,
  phone: true,
  profilePicture: true,
  accountStatus: true,
  role: true,
  createdAt: true,
  lastLoginAt: true,
  student: {
    select: {
      id: true,
      apogeeCode: true,
      cne: true,
      major: true,
      level: true,
      city: true,
      linkedinUrl: true,
    },
  },
  professor: {
    select: {
      id: true,
      employeeId: true,
      grade: true,
      specialty: true,
      department: true,
    },
  },
  administrator: {
    select: {
      id: true,
      employeeId: true,
      department: true,
      adminLevel: true,
    },
  },
  professional: {
    select: {
      id: true,
      company: true,
      jobTitle: true,
      sector: true,
      bio: true,
      isVerified: true,
      isEmailVerified: true,
      approvedAt: true,
      rejectedAt: true,
      suspendedAt: true,
    },
  },
};

module.exports = {
  badgeSelect,
  notificationSelect,
  professionalRequestLegacySelect,
  professionalRequestSelect,
  recentCertificateSelect,
  reportSelect,
  userSelect,
};
