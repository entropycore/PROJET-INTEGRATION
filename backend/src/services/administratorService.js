'use strict';

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const prisma = require('../config/prisma');

const USER_ROLES = ['STUDENT', 'PROFESSOR', 'ADMINISTRATOR', 'PROFESSIONAL'];
const ACCOUNT_STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'];
const BCRYPT_ROUNDS = 10;

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

const isStructureMissingError = (err) =>
  err?.code === 'P2021' || err?.code === 'P2022';

const safeCount = async (runner) => {
  try {
    return await runner();
  } catch (err) {
    if (isStructureMissingError(err)) {
      return 0;
    }

    throw err;
  }
};

const safeAggregateCount = async (runner) => {
  try {
    return await runner();
  } catch (err) {
    if (isStructureMissingError(err)) {
      return 0;
    }

    throw err;
  }
};

const formatFullName = (user) => `${user.firstName} ${user.lastName}`.trim();

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
    professional: user.professional,
  },
});

const mapProfessionalRequest = (user) => ({
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
  organization: user.professional?.company || null,
  type: 'ACCESS_REQUEST',
  label: "Demande d'acces",
  tone: user.accountStatus === 'PENDING' ? 'orange' : 'green',
  professional: user.professional,
});

const buildUserSearch = (search) => {
  if (!search) {
    return undefined;
  }

  return [
    { firstName: { contains: search, mode: 'insensitive' } },
    { lastName: { contains: search, mode: 'insensitive' } },
    { email: { contains: search, mode: 'insensitive' } },
    {
      professional: {
        is: {
          company: { contains: search, mode: 'insensitive' },
        },
      },
    },
  ];
};

const normalizePagination = (page = 1, limit = 10) => {
  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  const safeLimit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 50) : 10;

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
};

const buildPagination = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});

const ensureValidRole = (role) => {
  if (!USER_ROLES.includes(role)) {
    throw new Error('INVALID_ROLE');
  }
};

const ensureValidStatus = (status) => {
  if (!ACCOUNT_STATUSES.includes(status)) {
    throw new Error('INVALID_STATUS');
  }
};

const buildRoleCreateData = (role, payload, accountStatus) => {
  switch (role) {
    case 'STUDENT':
      if (!payload.major || !payload.level) {
        throw new Error('MISSING_STUDENT_FIELDS');
      }

      return {
        student: {
          create: {
            apogeeCode: payload.apogeeCode || null,
            cne: payload.cne || null,
            major: payload.major,
            level: payload.level,
            city: payload.city || null,
            bio: payload.bio || null,
            linkedinUrl: payload.linkedinUrl || null,
          },
        },
      };

    case 'PROFESSOR':
      return {
        professor: {
          create: {
            employeeId: payload.employeeId || null,
            grade: payload.grade || null,
            specialty: payload.specialty || null,
            department: payload.department || null,
          },
        },
      };

    case 'ADMINISTRATOR':
      return {
        administrator: {
          create: {
            employeeId: payload.employeeId || null,
            department: payload.department || null,
            adminLevel: payload.adminLevel || null,
          },
        },
      };

    case 'PROFESSIONAL': {
      const activatedByAdmin = accountStatus === 'ACTIVE';

      return {
        professional: {
          create: {
            company: payload.company || null,
            jobTitle: payload.jobTitle || null,
            sector: payload.sector || null,
            bio: payload.bio || null,
            isEmailVerified:
              typeof payload.isEmailVerified === 'boolean'
                ? payload.isEmailVerified
                : activatedByAdmin,
            isVerified:
              typeof payload.isVerified === 'boolean'
                ? payload.isVerified
                : activatedByAdmin,
            emailVerifiedAt: activatedByAdmin ? new Date() : null,
            approvedAt: activatedByAdmin ? new Date() : null,
          },
        },
      };
    }

    default:
      throw new Error('INVALID_ROLE');
  }
};

const buildRoleUpdateData = (user, payload) => {
  if (user.role === 'STUDENT') {
    return {
      model: 'student',
      data: {
        apogeeCode: payload.apogeeCode,
        cne: payload.cne,
        major: payload.major,
        level: payload.level,
        city: payload.city,
        bio: payload.bio,
        linkedinUrl: payload.linkedinUrl,
      },
    };
  }

  if (user.role === 'PROFESSOR') {
    return {
      model: 'professor',
      data: {
        employeeId: payload.employeeId,
        grade: payload.grade,
        specialty: payload.specialty,
        department: payload.department,
      },
    };
  }

  if (user.role === 'ADMINISTRATOR') {
    return {
      model: 'administrator',
      data: {
        employeeId: payload.employeeId,
        department: payload.department,
        adminLevel: payload.adminLevel,
      },
    };
  }

  if (user.role === 'PROFESSIONAL') {
    return {
      model: 'professional',
      data: {
        company: payload.company,
        jobTitle: payload.jobTitle,
        sector: payload.sector,
        bio: payload.bio,
      },
    };
  }

  return null;
};

const stripUndefined = (payload) =>
  Object.fromEntries(Object.entries(payload).filter(([, value]) => typeof value !== 'undefined'));

const getUserOrThrow = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userSelect,
  });

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  return user;
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

const deleteCurrentProfile = async (tx, user) => {
  if (user.student) {
    await tx.student.delete({ where: { userId: user.id } });
  } else if (user.professor) {
    await tx.professor.delete({ where: { userId: user.id } });
  } else if (user.administrator) {
    await tx.administrator.delete({ where: { userId: user.id } });
  } else if (user.professional) {
    await tx.professional.delete({ where: { userId: user.id } });
  }
};

const ensureRoleChangeAllowed = async (user) => {
  if (user.role === 'STUDENT' && user.student) {
    const relatedCount = await safeAggregateCount(async () => {
      const [
        projectCount,
        internshipCount,
        activityCount,
        pathCount,
        skillCount,
        letterCount,
        recommendationCount,
      ] = await Promise.all([
        prisma.project.count({ where: { studentId: user.student.id } }),
        prisma.internship.count({ where: { studentId: user.student.id } }),
        prisma.extracurricularActivity.count({ where: { studentId: user.student.id } }),
        prisma.academicPath.count({ where: { studentId: user.student.id } }),
        prisma.studentSkill.count({ where: { studentId: user.student.id } }),
        prisma.recommendationLetter.count({ where: { studentId: user.student.id } }),
        prisma.recommendation.count({ where: { studentId: user.student.id } }),
      ]);

      return (
        projectCount +
        internshipCount +
        activityCount +
        pathCount +
        skillCount +
        letterCount +
        recommendationCount
      );
    });

    if (relatedCount > 0) {
      throw new Error('ROLE_CHANGE_BLOCKED_BY_RELATED_DATA');
    }
  }

  if (user.role === 'PROFESSOR' && user.professor) {
    const relatedCount = await safeAggregateCount(async () => {
      const [projectValidationCount, internshipValidationCount, supervisedInternshipCount] =
        await Promise.all([
          prisma.projectValidation.count({ where: { professorId: user.professor.id } }),
          prisma.internshipValidation.count({ where: { professorId: user.professor.id } }),
          prisma.internship.count({
            where: { supervisorProfessorId: user.professor.id },
          }),
        ]);

      return projectValidationCount + internshipValidationCount + supervisedInternshipCount;
    });

    if (relatedCount > 0) {
      throw new Error('ROLE_CHANGE_BLOCKED_BY_RELATED_DATA');
    }
  }

  if (user.role === 'ADMINISTRATOR' && user.administrator) {
    const relatedCount = await safeAggregateCount(async () => {
      const [certificateValidationCount, approvedCount, rejectedCount, suspendedCount] =
        await Promise.all([
          prisma.certificateValidation.count({
            where: { administratorId: user.administrator.id },
          }),
          prisma.professional.count({
            where: { approvedByAdministratorId: user.administrator.id },
          }),
          prisma.professional.count({
            where: { rejectedByAdministratorId: user.administrator.id },
          }),
          prisma.professional.count({
            where: { suspendedByAdministratorId: user.administrator.id },
          }),
        ]);

      return certificateValidationCount + approvedCount + rejectedCount + suspendedCount;
    });

    if (relatedCount > 0) {
      throw new Error('ROLE_CHANGE_BLOCKED_BY_RELATED_DATA');
    }
  }
};

const createProfileForRole = async (tx, userId, role, payload, accountStatus) => {
  switch (role) {
    case 'STUDENT':
      if (!payload.major || !payload.level) {
        throw new Error('MISSING_STUDENT_FIELDS');
      }

      await tx.student.create({
        data: {
          userId,
          apogeeCode: payload.apogeeCode || null,
          cne: payload.cne || null,
          major: payload.major,
          level: payload.level,
          city: payload.city || null,
          bio: payload.bio || null,
          linkedinUrl: payload.linkedinUrl || null,
        },
      });
      return;

    case 'PROFESSOR':
      await tx.professor.create({
        data: {
          userId,
          employeeId: payload.employeeId || null,
          grade: payload.grade || null,
          specialty: payload.specialty || null,
          department: payload.department || null,
        },
      });
      return;

    case 'ADMINISTRATOR':
      await tx.administrator.create({
        data: {
          userId,
          employeeId: payload.employeeId || null,
          department: payload.department || null,
          adminLevel: payload.adminLevel || null,
        },
      });
      return;

    case 'PROFESSIONAL': {
      const activatedByAdmin = accountStatus === 'ACTIVE';

      await tx.professional.create({
        data: {
          userId,
          company: payload.company || null,
          jobTitle: payload.jobTitle || null,
          sector: payload.sector || null,
          bio: payload.bio || null,
          isEmailVerified:
            typeof payload.isEmailVerified === 'boolean'
              ? payload.isEmailVerified
              : activatedByAdmin,
          isVerified:
            typeof payload.isVerified === 'boolean'
              ? payload.isVerified
              : activatedByAdmin,
          emailVerifiedAt: activatedByAdmin ? new Date() : null,
          approvedAt: activatedByAdmin ? new Date() : null,
        },
      });
      return;
    }

    default:
      throw new Error('INVALID_ROLE');
  }
};

const buildTemporaryPassword = () => {
  const suffix = crypto.randomBytes(4).toString('hex');
  return `Temp${suffix}Aa!1`;
};

exports.getDashboardData = async () => {
  const [
    totalUsers,
    totalStudents,
    totalProfessors,
    pendingRequests,
    pendingProjects,
    pendingInternships,
    pendingCertificates,
    pendingLetters,
    pendingComments,
    pendingRecommendations,
    recentRequests,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.user.count({ where: { role: 'PROFESSOR' } }),
    prisma.user.count({
      where: {
        role: 'PROFESSIONAL',
        accountStatus: 'PENDING',
      },
    }),
    safeCount(() => prisma.project.count({ where: { validationStatus: 'PENDING' } })),
    safeCount(() => prisma.internship.count({ where: { validationStatus: 'PENDING' } })),
    safeCount(() => prisma.certificate.count({ where: { validationStatus: 'PENDING' } })),
    safeCount(() => prisma.recommendationLetter.count({ where: { validationStatus: 'PENDING' } })),
    safeCount(() => prisma.comment.count({ where: { status: 'PENDING' } })),
    safeCount(() => prisma.recommendation.count({ where: { status: 'PENDING' } })),
    prisma.user.findMany({
      where: {
        role: 'PROFESSIONAL',
      },
      orderBy: [{ createdAt: 'desc' }],
      take: 5,
      select: professionalRequestSelect,
    }),
  ]);

  const pendingValidations =
    pendingProjects +
    pendingInternships +
    pendingCertificates +
    pendingLetters +
    pendingComments +
    pendingRecommendations;

  return {
    summaryCards: {
      totalUsers: { value: totalUsers, variation: 'Comptes enregistres' },
      totalStudents: { value: totalStudents, variation: 'Profils etudiants' },
      totalProfessors: { value: totalProfessors, variation: 'Profils professeurs' },
      pendingRequests: { value: pendingRequests, variation: 'Demandes professionnelles' },
    },
    urgentActions: {
      pendingAccessRequests: pendingRequests,
      pendingValidations,
      reports: 0,
    },
    recentRequests: recentRequests.map(mapProfessionalRequest),
  };
};

exports.getAdministratorProfile = async (userId) => {
  const profile = await prisma.administrator.findUnique({
    where: { userId },
    select: {
      id: true,
      employeeId: true,
      department: true,
      adminLevel: true,
      user: {
        select: {
          id: true,
          lastName: true,
          firstName: true,
          email: true,
          phone: true,
          profilePicture: true,
          accountStatus: true,
          createdAt: true,
          lastLoginAt: true,
        },
      },
    },
  });

  if (!profile) {
    throw new Error('ADMIN_PROFILE_NOT_FOUND');
  }

  return profile;
};

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

exports.updateUserRole = async (userId, role, payload = {}) => {
  const targetRole = String(role || '').toUpperCase();
  ensureValidRole(targetRole);

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

  await prisma.user.delete({
    where: { id: userId },
  });

  return {
    deleted: true,
    userId,
  };
};

exports.listProfessionalRequests = async ({ status, emailVerified, page = 1, limit = 10, search } = {}) => {
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
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      skip,
      take: safeLimit,
      select: professionalRequestSelect,
    }),
  ]);

  return {
    items: requests.map(mapProfessionalRequest),
    pagination: buildPagination(safePage, safeLimit, total),
  };
};

exports.getProfessionalRequest = async (userId) => {
  const request = await getProfessionalRequestOrThrow(userId);
  return mapProfessionalRequest(request);
};

exports.approveProfessionalRequest = async (userId, administratorId) => {
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

  return exports.getProfessionalRequest(userId);
};

exports.rejectProfessionalRequest = async (userId, administratorId, rejectionReason) => {
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

  return exports.getProfessionalRequest(userId);
};
