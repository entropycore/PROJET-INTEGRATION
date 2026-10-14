'use strict';

const bcrypt = require('bcrypt');
const prisma = require('../../config/prisma');
const sendEmail = require('../../utils/sendEmail');
const {
  buildPasswordResetEmail,
  buildRoleCreateData,
  buildRoleUpdateData,
  buildTemporaryPassword,
  buildUserCredentialsEmail,
  ensureValidRole,
  ensureValidStatus,
} = require('./userHelpers');
const { mapUserSummary } = require('./mappers');
const { userSelect } = require('./serviceSelects');
const { buildPagination, normalizePagination, stripUndefined } = require('./serviceUtils');
const {
  buildUserSearch,
  createProfileForRole,
  deleteCurrentProfile,
  ensureRoleChangeAllowed,
  getUserOrThrow,
} = require('./userData');

const BCRYPT_ROUNDS = 10;

const getUserById = async (userId) => {
  const user = await getUserOrThrow(userId);
  return mapUserSummary(user);
};

const listUsers = async ({ page = 1, limit = 10, search, role, status } = {}) => {
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

const createUser = async (payload) => {
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

  const providedPassword =
    typeof payload.password === 'string' && payload.password.trim().length > 0 ? payload.password : null;
  const initialPassword = providedPassword || buildTemporaryPassword();
  const passwordHash = await bcrypt.hash(initialPassword, BCRYPT_ROUNDS);
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

  try {
    const emailPayload = buildUserCredentialsEmail({
      firstName: createdUser.firstName,
      email: createdUser.email,
      password: initialPassword,
      role,
      accountStatus,
    });

    await sendEmail(createdUser.email, emailPayload.subject, emailPayload.text);
  } catch (err) {
    await prisma.user.delete({ where: { id: createdUser.id } });
    throw new Error('USER_EMAIL_SEND_FAILED', { cause: err });
  }

  return {
    user: mapUserSummary(createdUser),
    temporaryPassword: providedPassword ? null : initialPassword,
    credentialsSent: true,
  };
};

const updateUser = async (userId, payload) => {
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

  return getUserById(userId);
};

const updateUserStatus = async (userId, status, administratorId, reason) => {
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

  return getUserById(userId);
};

const updateUserRole = async (userId, role, payload = {}, currentUserId = null) => {
  const targetRole = String(role || '').toUpperCase();
  ensureValidRole(targetRole);

  if (currentUserId && userId === currentUserId) {
    throw new Error('CANNOT_CHANGE_OWN_ROLE');
  }

  const user = await getUserOrThrow(userId);
  if (user.role === targetRole) {
    return getUserById(userId);
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

  return getUserById(userId);
};

const deleteUser = async (userId, currentUserId) => {
  if (userId === currentUserId) {
    throw new Error('CANNOT_DELETE_SELF');
  }

  await getUserOrThrow(userId);

  try {
    await prisma.user.delete({ where: { id: userId } });
  } catch (err) {
    if (err?.code === 'P2003') {
      throw new Error('USER_DELETE_BLOCKED_BY_RELATED_DATA', { cause: err });
    }

    throw err;
  }

  return {
    deleted: true,
    userId,
  };
};

const resetUserPassword = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      email: true,
      role: true,
      accountStatus: true,
      passwordHash: true,
    },
  });

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  const temporaryPassword = buildTemporaryPassword();
  const passwordHash = await bcrypt.hash(temporaryPassword, BCRYPT_ROUNDS);
  let activeSessionIds = [];

  await prisma.$transaction(async (tx) => {
    const activeSessions = await tx.refreshTokenSession.findMany({
      where: { userId, isRevoked: false },
      select: { id: true },
    });

    activeSessionIds = activeSessions.map((session) => session.id);
    await tx.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    if (activeSessionIds.length > 0) {
      await tx.refreshTokenSession.updateMany({
        where: { id: { in: activeSessionIds } },
        data: { isRevoked: true, revokedAt: new Date() },
      });
    }
  });

  try {
    const emailPayload = buildPasswordResetEmail({
      firstName: user.firstName,
      email: user.email,
      password: temporaryPassword,
      role: user.role,
    });

    await sendEmail(user.email, emailPayload.subject, emailPayload.text);
  } catch (err) {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { passwordHash: user.passwordHash },
      });

      if (activeSessionIds.length > 0) {
        await tx.refreshTokenSession.updateMany({
          where: { id: { in: activeSessionIds } },
          data: { isRevoked: false, revokedAt: null },
        });
      }
    });

    throw new Error('USER_RESET_EMAIL_SEND_FAILED', { cause: err });
  }

  return {
    userId,
    temporaryPassword,
    credentialsSent: true,
  };
};

module.exports = {
  createUser,
  deleteUser,
  getUserById,
  listUsers,
  resetUserPassword,
  updateUser,
  updateUserRole,
  updateUserStatus,
};
