'use strict';

const formatFullName = (user) => `${user.firstName} ${user.lastName}`.trim();

const normalizeProfessionalData = (professional) => {
  if (!professional) {
    return null;
  }

  return {
    emailVerifiedAt: null,
    approvedAt: null,
    approvedByAdministratorId: null,
    rejectedAt: null,
    rejectedByAdministratorId: null,
    rejectionReason: null,
    suspendedAt: null,
    suspendedByAdministratorId: null,
    suspensionReason: null,
    ...professional,
  };
};

const getEmailVerifiedValue = (user) => {
  if (user.role === 'PROFESSIONAL') {
    return Boolean(user.professional?.isEmailVerified);
  }

  return true;
};

const mapUserSummary = (user) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  fullName: formatFullName(user),
  email: user.email,
  phone: user.phone,
  profilePicture: user.profilePicture,
  role: user.role,
  accountStatus: user.accountStatus,
  createdAt: user.createdAt,
  lastLoginAt: user.lastLoginAt,
  emailVerified: getEmailVerifiedValue(user),
  roleDetails: {
    student: user.student,
    professor: user.professor,
    administrator: user.administrator,
    professional: normalizeProfessionalData(user.professional),
  },
});

const mapProfessionalRequestDetail = (user) => {
  const professional = normalizeProfessionalData(user.professional);

  return {
    id: user.id,
    requesterName: formatFullName(user),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    profilePicture: user.profilePicture,
    accountStatus: user.accountStatus,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    organization: professional?.company || null,
    type: 'ACCESS_REQUEST',
    label: "Demande d'accès",
    tone: user.accountStatus === 'PENDING' ? 'orange' : 'green',
    professional,
  };
};

const mapDashboardAccessRequest = (user) => {
  const professional = normalizeProfessionalData(user.professional);

  return {
    id: user.id,
    type: 'ACCESS_REQUEST',
    label: "Demande d'accès",
    requesterName: formatFullName(user),
    email: user.email,
    organization: professional?.company || null,
    createdAt: user.createdAt,
    tone: user.accountStatus === 'PENDING' ? 'orange' : 'green',
    status: user.accountStatus,
    raw: {
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      profilePicture: user.profilePicture,
      lastLoginAt: user.lastLoginAt,
      accountStatus: user.accountStatus,
      professional,
    },
  };
};


module.exports = {
  formatFullName,
  mapDashboardAccessRequest,
  mapProfessionalRequestDetail,
  mapUserSummary,
};
