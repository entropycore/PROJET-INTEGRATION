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

exports.listUsers = async ({ page = 1, limit = 10, search, role, status } = {}) => {
  if (role) {
    ensureValidRole(role);
  }

  if (status) {
    ensureValidStatus(status);
  }

  const { skip, page: safePage, limit: safeLimit } = normalizePagination(page, limit);

  const where = {
    ...(role ? { role } : {}),
    ...(status ? { accountStatus: status } : {}),
    ...(search ? { OR: buildUserSearch(search) } : {}),
  };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      skip,
      take: safeLimit,
      select: userSelect,
    }),
  ]);

  return {
    items: users.map(mapUserSummary),
    pagination: buildPagination(safePage, safeLimit, total),
  };
};

exports.getUserById = async (userId) => {
  const user = await getUserOrThrow(userId);
  return mapUserSummary(user);
};

exports.createUser = async (payload) => {
  const role = String(payload.role || '').toUpperCase();
  const accountStatus = String(payload.accountStatus || 'ACTIVE').toUpperCase();

  ensureValidRole(role);
  ensureValidStatus(accountStatus);

  if (!payload.firstName || !payload.lastName || !payload.email) {
    throw new Error('MISSING_REQUIRED_FIELDS');
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
    select: { id: true },
  });

  if (existingUser) {
    throw new Error('EMAIL_ALREADY_EXISTS');
  }

  const temporaryPassword = payload.password || buildTemporaryPassword();
  const passwordHash = await bcrypt.hash(temporaryPassword, BCRYPT_ROUNDS);

  const createdUser = await prisma.user.create({
    data: {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone || null,
      profilePicture: payload.profilePicture || null,
      accountStatus,
      role,
      passwordHash,
      ...buildRoleCreateData(role, payload, accountStatus),
    },
    select: userSelect,
  });

  return {
    user: mapUserSummary(createdUser),
    temporaryPassword: payload.password ? null : temporaryPassword,
  };
};

exports.updateUser = async (userId, payload) => {
  const user = await getUserOrThrow(userId);

  if (payload.role && String(payload.role).toUpperCase() !== user.role) {
    throw new Error('ROLE_CHANGE_REQUIRES_DEDICATED_ENDPOINT');
  }

  const commonData = stripUndefined({
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    phone: payload.phone,
    profilePicture: payload.profilePicture,
  });

  await prisma.$transaction(async (tx) => {
    if (Object.keys(commonData).length > 0) {
      await tx.user.update({
        where: { id: userId },
        data: commonData,
      });
    }

    const profileUpdate = buildRoleUpdateData(user, payload);
    if (profileUpdate) {
      const scopedData = stripUndefined(profileUpdate.data);
      if (Object.keys(scopedData).length > 0) {
        await tx[profileUpdate.model].update({
          where: { userId },
          data: scopedData,
        });
      }
    }
  });

  return exports.getUserById(userId);
};

exports.updateUserStatus = async (userId, status, administratorId, reason) => {
  ensureValidStatus(status);

  const user = await getUserOrThrow(userId);

  if (user.role === 'PROFESSIONAL' && status === 'ACTIVE' && !user.professional?.isVerified) {
    throw new Error('USE_PROFESSIONAL_APPROVAL_FLOW');
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { accountStatus: status },
    });

    if (user.role === 'PROFESSIONAL' && user.professional) {
      if (status === 'SUSPENDED') {
        await tx.professional.update({
          where: { userId },
          data: {
            suspendedAt: new Date(),
            suspendedByAdministratorId: administratorId || null,
            suspensionReason: reason || null,
          },
        });
      } else if (user.professional.suspendedAt) {
        await tx.professional.update({
          where: { userId },
          data: {
            suspendedAt: null,
            suspendedByAdministratorId: null,
            suspensionReason: null,
          },
        });
      }
    }
  });

  return exports.getUserById(userId);
};

exports.updateUserRole = async (userId, role, payload = {}, currentUserId = null) => {
  const targetRole = String(role || '').toUpperCase();
  ensureValidRole(targetRole);

  if (currentUserId && userId === currentUserId) {
    throw new Error('CANNOT_CHANGE_OWN_ROLE');
  }

  const user = await getUserOrThrow(userId);

  if (user.role === targetRole) {
    return exports.getUserById(userId);
  }

  await ensureRoleChangeAllowed(user);

  await prisma.$transaction(async (tx) => {
    await deleteCurrentProfile(tx, user);

    await tx.user.update({
      where: { id: userId },
      data: { role: targetRole },
    });

    await createProfileForRole(tx, userId, targetRole, payload, user.accountStatus);
  });

  return exports.getUserById(userId);
};

exports.resetUserPassword = async (userId) => {
  await getUserOrThrow(userId);

  const temporaryPassword = buildTemporaryPassword();
  const passwordHash = await bcrypt.hash(temporaryPassword, BCRYPT_ROUNDS);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    await tx.refreshTokenSession.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true, revokedAt: new Date() },
    });
  });

  return {
    userId,
    temporaryPassword,
  };
};

exports.deleteUser = async (userId, currentUserId) => {
  if (userId === currentUserId) {
    throw new Error('CANNOT_DELETE_SELF');
  }

  await getUserOrThrow(userId);

  try {
    await prisma.user.delete({
      where: { id: userId },
    });
  } catch (err) {
    if (err?.code === 'P2003') {
      throw new Error('USER_DELETE_BLOCKED_BY_RELATED_DATA');
    }

    throw err;
  }

  return {
    deleted: true,
    userId,
  };
};
