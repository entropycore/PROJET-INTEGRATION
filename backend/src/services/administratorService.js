'use strict';

const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const sendEmail = require('../utils/sendEmail');
const notificationService = require('./notificationService');
const {
  formatFullName,
  mapCertificateRequestDetail,
  mapCommentValidationItem,
  mapDashboardAccessRequest,
  mapDashboardCertificateRequest,
  mapInternshipValidationItem,
  mapNotificationItem,
  mapProfessionalRequestDetail,
  mapProjectValidationItem,
  mapRecommendationLetterValidationItem,
  mapRecommendationValidationItem,
  mapReportItem,
  mapUserSummary,
  mapValidationItemToLegacyShape,
} = require('./administrator/mappers');
const {
  buildPasswordResetEmail,
  buildProfessionalProfileData,
  buildRoleCreateData,
  buildRoleUpdateData,
  buildTemporaryPassword,
  buildUserCredentialsEmail,
  ensureValidRole,
  ensureValidStatus,
} = require('./administrator/userHelpers');
const {
  certificateDetailSelect,
  commentValidationSelect,
  internshipValidationSelect,
  projectValidationSelect,
  recommendationLetterValidationSelect,
  recommendationValidationSelect,
} = require('./administrator/validationSelects');

const VALIDATION_ITEM_TYPES = [
  'PROJECT',
  'INTERNSHIP',
  'CERTIFICATE_VALIDATION',
  'RECOMMENDATION_LETTER_VALIDATION',
  'COMMENT_VALIDATION',
  'RECOMMENDATION_VALIDATION',
];
const LEGACY_VALIDATION_TYPES = ['PROJECT', 'INTERNSHIP', 'CERTIFICATE', 'ACTIVITY'];
const NOTIFICATION_TYPES = [
  'ACCESS_REQUEST',
  'CERTIFICATE_VALIDATION',
  'RECOMMENDATION_LETTER_VALIDATION',
  'COMMENT_VALIDATION',
  'RECOMMENDATION_VALIDATION',
  'REPORT',
  'SYSTEM',
];
const LEGACY_NOTIFICATION_TYPES = ['INFO', 'VALIDATION', 'ALERT'];
const REPORT_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];
const REPORT_TARGET_TYPES = ['PORTFOLIO', 'COMMENT', 'RECOMMENDATION', 'PROJECT', 'INTERNSHIP', 'USER', 'OTHER'];
const DELETABLE_REPORT_TARGET_TYPES = new Set(['PORTFOLIO', 'COMMENT', 'RECOMMENDATION', 'PROJECT', 'INTERNSHIP']);
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

const isStructureMissingError = (err) => err?.code === 'P2021' || err?.code === 'P2022';

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

const safeReadWithFallback = async (primaryRunner, fallbackRunner, defaultValue) => {
  try {
    return await primaryRunner();
  } catch (err) {
    if (!isStructureMissingError(err)) {
      throw err;
    }

    if (!fallbackRunner) {
      return defaultValue;
    }

    try {
      return await fallbackRunner();
    } catch (fallbackErr) {
      if (isStructureMissingError(fallbackErr)) {
        return defaultValue;
      }

      throw fallbackErr;
    }
  }
};

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

const buildBadgeSearch = (search) => {
  if (!search) {
    return undefined;
  }

  return [
    { name: { contains: search, mode: 'insensitive' } },
    { description: { contains: search, mode: 'insensitive' } },
    { rule: { contains: search, mode: 'insensitive' } },
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

const normalizeValidationType = (value) =>
  typeof value === 'string' ? value.trim().toUpperCase().replace(/-/g, '_') : value;

const ensureValidValidationType = (type) => {
  if (!VALIDATION_ITEM_TYPES.includes(type)) {
    throw new Error('UNSUPPORTED_VALIDATION_TYPE');
  }
};

const normalizeLegacyValidationType = (value) =>
  typeof value === 'string' ? value.trim().toUpperCase().replace(/-/g, '_') : value;

const ensureValidLegacyValidationType = (type) => {
  if (!LEGACY_VALIDATION_TYPES.includes(type)) {
    throw new Error('UNSUPPORTED_LEGACY_VALIDATION_TYPE');
  }
};

const ensureValidNotificationType = (type) => {
  if (!NOTIFICATION_TYPES.includes(type) && !LEGACY_NOTIFICATION_TYPES.includes(type)) {
    throw new Error('INVALID_NOTIFICATION_TYPE');
  }
};

const getNotificationFilterByType = (type) => {
  switch (type) {
    case 'INFO':
      return { in: ['ACCESS_REQUEST', 'SYSTEM'] };
    case 'VALIDATION':
      return {
        in: [
          'CERTIFICATE_VALIDATION',
          'RECOMMENDATION_LETTER_VALIDATION',
          'COMMENT_VALIDATION',
          'RECOMMENDATION_VALIDATION',
        ],
      };
    case 'ALERT':
      return { in: ['REPORT'] };
    default:
      return type;
  }
};

const ensureValidReportStatus = (status) => {
  if (!REPORT_STATUSES.includes(status)) {
    throw new Error('INVALID_REPORT_STATUS');
  }
};

const ensureValidReportTargetType = (targetType) => {
  if (!REPORT_TARGET_TYPES.includes(targetType)) {
    throw new Error('UNSUPPORTED_REPORT_TARGET_TYPE');
  }
};

const deleteReportTargetRecord = async (tx, report) => {
  if (!DELETABLE_REPORT_TARGET_TYPES.has(report.targetType)) {
    return 'resolved_without_target_deletion';
  }

  try {
    switch (report.targetType) {
      case 'PORTFOLIO':
        if (!report.targetId) {
          throw new Error('REPORT_TARGET_NOT_FOUND');
        }
        await tx.portfolio.delete({
          where: { id: report.targetId },
        });
        return 'deleted';

      case 'COMMENT':
        if (!report.targetId) {
          throw new Error('REPORT_TARGET_NOT_FOUND');
        }
        await tx.comment.delete({
          where: { id: report.targetId },
        });
        return 'deleted';

      case 'RECOMMENDATION':
        if (!report.targetId) {
          throw new Error('REPORT_TARGET_NOT_FOUND');
        }
        await tx.recommendation.delete({
          where: { id: report.targetId },
        });
        return 'deleted';

      case 'PROJECT':
        if (!report.targetId) {
          throw new Error('REPORT_TARGET_NOT_FOUND');
        }
        await tx.project.delete({
          where: { id: report.targetId },
        });
        return 'deleted';

      case 'INTERNSHIP':
        if (!report.targetId) {
          throw new Error('REPORT_TARGET_NOT_FOUND');
        }
        await tx.internship.delete({
          where: { id: report.targetId },
        });
        return 'deleted';

      default:
        return 'resolved_without_target_deletion';
    }
  } catch (err) {
    if (err?.code === 'P2025') {
      throw new Error('REPORT_TARGET_NOT_FOUND', { cause: err });
    }

    throw err;
  }
};

const paginateItems = (items, page = 1, limit = 10) => {
  const { page: safePage, limit: safeLimit, skip } = normalizePagination(page, limit);

  return {
    items: items.slice(skip, skip + safeLimit),
    pagination: buildPagination(safePage, safeLimit, items.length),
  };
};

const normalizeSearch = (value) =>
  String(value || '')
    .trim()
    .toLowerCase();

const normalizeRequiredText = (value) => (typeof value === 'string' ? value.trim() : '');

const normalizeOptionalText = (value) => {
  if (typeof value !== 'string') {
    return value == null ? null : value;
  }

  const trimmed = value.trim();
  return trimmed || null;
};

const normalizeEmail = (value) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

const findUserByEmail = (email, select = { id: true }) =>
  prisma.user.findFirst({
    where: {
      email: {
        equals: normalizeEmail(email),
        mode: 'insensitive',
      },
    },
    select,
  });

const readTextValue = (payload, names) => {
  for (const name of names) {
    if (typeof payload?.[name] === 'string') {
      return payload[name].trim() || null;
    }
  }

  return null;
};

const normalizeBadgeTone = (value) => {
  const normalized = normalizeRequiredText(value);
  return normalized || 'blue';
};

const hasBadgeFeature = () => typeof prisma.badge?.findMany === 'function';

const ensureBadgeFeatureAvailable = () => {
  if (!hasBadgeFeature()) {
    throw new Error('BADGE_FEATURE_UNAVAILABLE');
  }

  return prisma.badge;
};

const mapBadgeItem = (badge) => ({
  id: badge.id,
  name: badge.name,
  description: badge.description,
  rule: badge.rule,
  iconUrl: badge.iconUrl || '',
  iconFallback: '🏅',
  tone: badge.tone || 'blue',
  attributionCount: 0,
  createdAt: badge.createdAt,
  updatedAt: badge.updatedAt,
});

const getBadgeOrThrow = async (badgeId) => {
  let badge;

  try {
    badge = await ensureBadgeFeatureAvailable().findUnique({
      where: { id: badgeId },
      select: badgeSelect,
    });
  } catch (err) {
    if (isStructureMissingError(err)) {
      throw new Error('BADGE_FEATURE_UNAVAILABLE', { cause: err });
    }

    throw err;
  }

  if (!badge) {
    throw new Error('BADGE_NOT_FOUND');
  }

  return badge;
};

const ensureUniqueBadgeName = async (name, excludedBadgeId = null) => {
  try {
    const existingBadge = await ensureBadgeFeatureAvailable().findFirst({
      where: {
        name,
        ...(excludedBadgeId
          ? {
              NOT: { id: excludedBadgeId },
            }
          : {}),
      },
      select: {
        id: true,
      },
    });

    if (existingBadge) {
      throw new Error('BADGE_NAME_ALREADY_EXISTS');
    }
  } catch (err) {
    if (isStructureMissingError(err)) {
      throw new Error('BADGE_FEATURE_UNAVAILABLE', { cause: err });
    }

    throw err;
  }
};

const matchesValidationSearch = (item, search) => {
  const normalizedSearch = normalizeSearch(search);

  if (!normalizedSearch) {
    return true;
  }

  const haystacks = [
    item.requesterName,
    item.email,
    item.label,
    item.organization,
    item.raw?.title,
    item.raw?.activityTitle,
    item.raw?.portfolioTitle,
    item.raw?.authorName,
    item.raw?.studentName,
    item.raw?.reason,
    item.raw?.description,
    item.raw?.targetType,
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  return haystacks.some((value) => value.includes(normalizedSearch));
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

const getCertificateRequestOrThrow = async (certificateId) => {
  const certificate = await safeReadWithFallback(
    () =>
      prisma.certificate.findUnique({
        where: { id: certificateId },
        select: certificateDetailSelect,
      }),
    null,
    null,
  );

  if (!certificate) {
    throw new Error('DASHBOARD_ITEM_NOT_FOUND');
  }

  return certificate;
};

const getValidationCertificateOrThrow = async (certificateId) => {
  try {
    return await getCertificateRequestOrThrow(certificateId);
  } catch (err) {
    if (err.message === 'DASHBOARD_ITEM_NOT_FOUND') {
      throw new Error('VALIDATION_ITEM_NOT_FOUND', { cause: err });
    }

    throw err;
  }
};

const getReportOrThrow = async (reportId) => {
  const report = await safeReadWithFallback(
    () =>
      prisma.report.findUnique({
        where: { id: reportId },
        select: reportSelect,
      }),
    null,
    null,
  );

  if (!report) {
    throw new Error('REPORT_NOT_FOUND');
  }

  return report;
};

const getNotificationOrThrow = async (notificationId, administratorId = null) => {
  const scopeConditions = administratorId ? [{ OR: [{ administratorId }, { administratorId: null }] }] : [];

  const notification = await safeReadWithFallback(
    () =>
      prisma.notification.findFirst({
        where: {
          id: notificationId,
          ...(scopeConditions.length
            ? {
                AND: scopeConditions,
              }
            : {}),
        },
        select: notificationSelect,
      }),
    null,
    null,
  );

  if (!notification) {
    throw new Error('NOTIFICATION_NOT_FOUND');
  }

  return notification;
};

const getRecommendationLetterValidationOrThrow = async (letterId) => {
  const letter = await safeReadWithFallback(
    () =>
      prisma.recommendationLetter.findUnique({
        where: { id: letterId },
        select: recommendationLetterValidationSelect,
      }),
    null,
    null,
  );

  if (!letter) {
    throw new Error('VALIDATION_ITEM_NOT_FOUND');
  }

  return letter;
};

const getCommentValidationOrThrow = async (commentId) => {
  const comment = await safeReadWithFallback(
    () =>
      prisma.comment.findUnique({
        where: { id: commentId },
        select: commentValidationSelect,
      }),
    null,
    null,
  );

  if (!comment) {
    throw new Error('VALIDATION_ITEM_NOT_FOUND');
  }

  return comment;
};

const getRecommendationValidationOrThrow = async (recommendationId) => {
  const recommendation = await safeReadWithFallback(
    () =>
      prisma.recommendation.findUnique({
        where: { id: recommendationId },
        select: recommendationValidationSelect,
      }),
    null,
    null,
  );

  if (!recommendation) {
    throw new Error('VALIDATION_ITEM_NOT_FOUND');
  }

  return recommendation;
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
      const [projectCount, internshipCount, activityCount, pathCount, skillCount, letterCount, recommendationCount] =
        await Promise.all([
          prisma.project.count({ where: { studentId: user.student.id } }),
          prisma.internship.count({ where: { studentId: user.student.id } }),
          prisma.extracurricularActivity.count({
            where: { studentId: user.student.id },
          }),
          prisma.academicPath.count({ where: { studentId: user.student.id } }),
          prisma.studentSkill.count({ where: { studentId: user.student.id } }),
          prisma.recommendationLetter.count({
            where: { studentId: user.student.id },
          }),
          prisma.recommendation.count({ where: { studentId: user.student.id } }),
        ]);

      return (
        projectCount + internshipCount + activityCount + pathCount + skillCount + letterCount + recommendationCount
      );
    });

    if (relatedCount > 0) {
      throw new Error('ROLE_CHANGE_BLOCKED_BY_RELATED_DATA');
    }
  }

  if (user.role === 'PROFESSOR' && user.professor) {
    const relatedCount = await safeAggregateCount(async () => {
      const [projectValidationCount, internshipValidationCount, supervisedInternshipCount] = await Promise.all([
        prisma.projectValidation.count({
          where: { professorId: user.professor.id },
        }),
        prisma.internshipValidation.count({
          where: { professorId: user.professor.id },
        }),
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
      const [certificateValidationCount, approvedCount, rejectedCount, suspendedCount] = await Promise.all([
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
      await tx.professional.create({
        data: {
          userId,
          ...buildProfessionalProfileData(payload, accountStatus),
        },
      });
      return;
    }

    default:
      throw new Error('INVALID_ROLE');
  }
};

const getPendingValidationCounts = async () => {
  const [
    pendingProjects,
    pendingInternships,
    pendingCertificates,
    pendingLetters,
    pendingComments,
    pendingRecommendations,
  ] = await Promise.all([
    safeCount(() => prisma.project.count({ where: { validationStatus: 'PENDING' } })),
    safeCount(() => prisma.internship.count({ where: { validationStatus: 'PENDING' } })),
    safeCount(() => prisma.certificate.count({ where: { validationStatus: 'PENDING' } })),
    safeCount(() =>
      prisma.recommendationLetter.count({
        where: { validationStatus: 'PENDING' },
      }),
    ),
    safeCount(() => prisma.comment.count({ where: { status: 'PENDING' } })),
    safeCount(() => prisma.recommendation.count({ where: { status: 'PENDING' } })),
  ]);

  return {
    pendingProjects,
    pendingInternships,
    pendingCertificates,
    pendingLetters,
    pendingComments,
    pendingRecommendations,
    total:
      pendingProjects +
      pendingInternships +
      pendingCertificates +
      pendingLetters +
      pendingComments +
      pendingRecommendations,
  };
};

const mapLegacyPendingValidationCounts = (counts) => ({
  count: counts.total,
  projects: counts.pendingProjects,
  internships: counts.pendingInternships,
  certificates: counts.pendingCertificates,
  activities: counts.pendingLetters + counts.pendingComments + counts.pendingRecommendations,
});

const getRecentProfessionalRequests = async () =>
  safeReadWithFallback(
    () =>
      prisma.user.findMany({
        where: {
          role: 'PROFESSIONAL',
          accountStatus: 'PENDING',
        },
        orderBy: [{ createdAt: 'desc' }],
        take: 5,
        select: professionalRequestSelect,
      }),
    () =>
      prisma.user.findMany({
        where: {
          role: 'PROFESSIONAL',
          accountStatus: 'PENDING',
        },
        orderBy: [{ createdAt: 'desc' }],
        take: 5,
        select: professionalRequestLegacySelect,
      }),
    [],
  );

const getRecentCertificateRequests = async () =>
  safeReadWithFallback(
    () =>
      prisma.certificate.findMany({
        where: {
          validationStatus: 'PENDING',
        },
        orderBy: [{ submittedAt: 'desc' }],
        take: 5,
        select: recentCertificateSelect,
      }),
    null,
    [],
  );

const getRecentReportItems = async () =>
  safeReadWithFallback(
    () =>
      prisma.report.findMany({
        where: {
          status: 'PENDING',
        },
        orderBy: [{ createdAt: 'desc' }],
        take: 5,
        select: reportSelect,
      }),
    null,
    [],
  );

const getRecentDashboardRequests = async () => {
  const [professionalRequests, certificateRequests, reportItems] = await Promise.all([
    getRecentProfessionalRequests(),
    getRecentCertificateRequests(),
    getRecentReportItems(),
  ]);

  return [
    ...professionalRequests.map(mapDashboardAccessRequest),
    ...certificateRequests.map(mapDashboardCertificateRequest),
    ...reportItems.map(mapReportItem),
  ]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 5);
};

const syncPendingAccessRequestNotifications = async () => {
  const requests = await safeReadWithFallback(
    () =>
      prisma.user.findMany({
        where: {
          role: 'PROFESSIONAL',
          accountStatus: 'PENDING',
        },
        orderBy: [{ createdAt: 'desc' }],
        take: 100,
        select: professionalRequestSelect,
      }),
    () =>
      prisma.user.findMany({
        where: {
          role: 'PROFESSIONAL',
          accountStatus: 'PENDING',
        },
        orderBy: [{ createdAt: 'desc' }],
        take: 100,
        select: professionalRequestLegacySelect,
      }),
    [],
  );

  await Promise.all(
    requests.map((request) => notificationService.ensurePendingItemNotification(mapDashboardAccessRequest(request))),
  );
};

const syncPendingValidationNotifications = async () => {
  const [certificates, letters, comments, recommendations] = await Promise.all([
    loadCertificateValidationItems('PENDING'),
    loadRecommendationLetterValidationItems('PENDING'),
    loadCommentValidationItems('PENDING'),
    loadRecommendationValidationItems('PENDING'),
  ]);

  const items = [
    ...certificates.map(mapDashboardCertificateRequest),
    ...letters.map(mapRecommendationLetterValidationItem),
    ...comments.map(mapCommentValidationItem),
    ...recommendations.map(mapRecommendationValidationItem),
  ];

  await Promise.all(items.map((item) => notificationService.ensurePendingItemNotification(item)));
};

const syncPendingReportNotifications = async () => {
  const reports = await loadReportItems('PENDING', null);

  await Promise.all(reports.map((report) => notificationService.ensurePendingItemNotification(mapReportItem(report))));
};

const syncAdminNotifications = async () => {
  await Promise.all([
    syncPendingAccessRequestNotifications(),
    syncPendingValidationNotifications(),
    syncPendingReportNotifications(),
  ]);
};

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

const loadCertificateValidationItems = async (status) =>
  safeReadWithFallback(
    () =>
      prisma.certificate.findMany({
        where: { validationStatus: status },
        orderBy: [{ submittedAt: 'desc' }],
        take: 100,
        select: certificateDetailSelect,
      }),
    null,
    [],
  );

const loadProjectValidationItems = async (status) =>
  safeReadWithFallback(
    () =>
      prisma.project.findMany({
        where: { validationStatus: status },
        orderBy: [{ submittedAt: 'desc' }, { createdAt: 'desc' }],
        take: 100,
        select: projectValidationSelect,
      }),
    null,
    [],
  );

const loadInternshipValidationItems = async (status) =>
  safeReadWithFallback(
    () =>
      prisma.internship.findMany({
        where: { validationStatus: status },
        orderBy: [{ startDate: 'desc' }, { endDate: 'desc' }],
        take: 100,
        select: internshipValidationSelect,
      }),
    null,
    [],
  );

const loadRecommendationLetterValidationItems = async (status) =>
  safeReadWithFallback(
    () =>
      prisma.recommendationLetter.findMany({
        where: { validationStatus: status },
        orderBy: [{ createdAt: 'desc' }],
        take: 100,
        select: recommendationLetterValidationSelect,
      }),
    null,
    [],
  );

const loadCommentValidationItems = async (status) =>
  safeReadWithFallback(
    () =>
      prisma.comment.findMany({
        where: { status },
        orderBy: [{ createdAt: 'desc' }],
        take: 100,
        select: commentValidationSelect,
      }),
    null,
    [],
  );

const loadRecommendationValidationItems = async (status) =>
  safeReadWithFallback(
    () =>
      prisma.recommendation.findMany({
        where: { status },
        orderBy: [{ createdAt: 'desc' }],
        take: 100,
        select: recommendationValidationSelect,
      }),
    null,
    [],
  );

const resolveValidationItemTypeById = async (itemId) => {
  const [project, internship, certificate, letter, comment, recommendation] = await Promise.all([
    safeReadWithFallback(
      () =>
        prisma.project.findUnique({
          where: { id: itemId },
          select: { id: true },
        }),
      null,
      null,
    ),
    safeReadWithFallback(
      () =>
        prisma.internship.findUnique({
          where: { id: itemId },
          select: { id: true },
        }),
      null,
      null,
    ),
    safeReadWithFallback(
      () =>
        prisma.certificate.findUnique({
          where: { id: itemId },
          select: { id: true },
        }),
      null,
      null,
    ),
    safeReadWithFallback(
      () =>
        prisma.recommendationLetter.findUnique({
          where: { id: itemId },
          select: { id: true },
        }),
      null,
      null,
    ),
    safeReadWithFallback(
      () =>
        prisma.comment.findUnique({
          where: { id: itemId },
          select: { id: true },
        }),
      null,
      null,
    ),
    safeReadWithFallback(
      () =>
        prisma.recommendation.findUnique({
          where: { id: itemId },
          select: { id: true },
        }),
      null,
      null,
    ),
  ]);

  if (project) return 'PROJECT';
  if (internship) return 'INTERNSHIP';
  if (certificate) return 'CERTIFICATE_VALIDATION';
  if (letter) return 'RECOMMENDATION_LETTER_VALIDATION';
  if (comment) return 'COMMENT_VALIDATION';
  if (recommendation) return 'RECOMMENDATION_VALIDATION';

  throw new Error('VALIDATION_ITEM_NOT_FOUND');
};

const loadReportItems = async (status, targetType) =>
  safeReadWithFallback(
    () =>
      prisma.report.findMany({
        where: {
          ...(status ? { status } : {}),
          ...(targetType ? { targetType } : {}),
        },
        orderBy: [{ createdAt: 'desc' }],
        take: 100,
        select: reportSelect,
      }),
    null,
    [],
  );

const approveProjectValidation = async (projectId, feedback = null) => {
  const project = await getProjectValidationOrThrow(projectId);

  if (project.validationStatus !== 'PENDING') {
    throw new Error('VALIDATION_ITEM_INVALID_STATE');
  }

  await prisma.project.update({
    where: { id: projectId },
    data: {
      validationStatus: 'APPROVED',
      generalFeedback: feedback,
    },
  });

  return mapProjectValidationItem(await getProjectValidationOrThrow(projectId));
};

const rejectProjectValidation = async (projectId, feedback = null) => {
  const project = await getProjectValidationOrThrow(projectId);

  if (project.validationStatus !== 'PENDING') {
    throw new Error('VALIDATION_ITEM_INVALID_STATE');
  }

  await prisma.project.update({
    where: { id: projectId },
    data: {
      validationStatus: 'REJECTED',
      generalFeedback: feedback,
    },
  });

  return mapProjectValidationItem(await getProjectValidationOrThrow(projectId));
};

const requestProjectValidationChanges = async (projectId, feedback = null) => {
  const project = await getProjectValidationOrThrow(projectId);

  if (project.validationStatus !== 'PENDING') {
    throw new Error('VALIDATION_ITEM_INVALID_STATE');
  }

  await prisma.project.update({
    where: { id: projectId },
    data: {
      validationStatus: 'CHANGES_REQUESTED',
      generalFeedback: feedback,
    },
  });

  return mapProjectValidationItem(await getProjectValidationOrThrow(projectId));
};

const approveInternshipValidation = async (internshipId) => {
  const internship = await getInternshipValidationOrThrow(internshipId);

  if (internship.validationStatus !== 'PENDING') {
    throw new Error('VALIDATION_ITEM_INVALID_STATE');
  }

  await prisma.internship.update({
    where: { id: internshipId },
    data: {
      validationStatus: 'APPROVED',
    },
  });

  return mapInternshipValidationItem(await getInternshipValidationOrThrow(internshipId));
};

const rejectInternshipValidation = async (internshipId) => {
  const internship = await getInternshipValidationOrThrow(internshipId);

  if (internship.validationStatus !== 'PENDING') {
    throw new Error('VALIDATION_ITEM_INVALID_STATE');
  }

  await prisma.internship.update({
    where: { id: internshipId },
    data: {
      validationStatus: 'REJECTED',
    },
  });

  return mapInternshipValidationItem(await getInternshipValidationOrThrow(internshipId));
};

const requestInternshipValidationChanges = async (internshipId) => {
  const internship = await getInternshipValidationOrThrow(internshipId);

  if (internship.validationStatus !== 'PENDING') {
    throw new Error('VALIDATION_ITEM_INVALID_STATE');
  }

  await prisma.internship.update({
    where: { id: internshipId },
    data: {
      validationStatus: 'CHANGES_REQUESTED',
    },
  });

  return mapInternshipValidationItem(await getInternshipValidationOrThrow(internshipId));
};

const approveCertificateRequest = async (certificateId, administratorId, comment = null) => {
  const certificate = await getCertificateRequestOrThrow(certificateId);

  if (certificate.validationStatus !== 'PENDING') {
    throw new Error('VALIDATION_ITEM_INVALID_STATE');
  }

  await prisma.$transaction(async (tx) => {
    await tx.certificate.update({
      where: { id: certificateId },
      data: { validationStatus: 'APPROVED' },
    });

    await tx.certificateValidation.create({
      data: {
        certificateId,
        administratorId,
        decision: 'APPROVED',
        comment,
      },
    });
  });

  const updatedCertificate = await getCertificateRequestOrThrow(certificateId);
  await notificationService.createAdminActionNotification({
    title: 'Validation approuvée',
    message: `La validation du certificat de ${
      updatedCertificate.activity?.student?.user
        ? formatFullName(updatedCertificate.activity.student.user)
        : 'un étudiant'
    } a été approuvée.`,
    relatedType: 'CERTIFICATE_VALIDATION',
    relatedId: certificateId,
  });
  return mapCertificateRequestDetail(updatedCertificate);
};

const rejectCertificateRequest = async (certificateId, administratorId, comment = null) => {
  const certificate = await getCertificateRequestOrThrow(certificateId);

  if (certificate.validationStatus !== 'PENDING') {
    throw new Error('VALIDATION_ITEM_INVALID_STATE');
  }

  await prisma.$transaction(async (tx) => {
    await tx.certificate.update({
      where: { id: certificateId },
      data: { validationStatus: 'REJECTED' },
    });

    await tx.certificateValidation.create({
      data: {
        certificateId,
        administratorId,
        decision: 'REJECTED',
        comment,
      },
    });
  });

  const updatedCertificate = await getCertificateRequestOrThrow(certificateId);
  await notificationService.createAdminActionNotification({
    title: 'Validation rejetée',
    message: `La validation du certificat de ${
      updatedCertificate.activity?.student?.user
        ? formatFullName(updatedCertificate.activity.student.user)
        : 'un étudiant'
    } a été rejetée.`,
    relatedType: 'CERTIFICATE_VALIDATION',
    relatedId: certificateId,
  });
  return mapCertificateRequestDetail(updatedCertificate);
};

const approveRecommendationLetterValidation = async (letterId, actorUserId) => {
  const letter = await getRecommendationLetterValidationOrThrow(letterId);

  if (letter.validationStatus !== 'PENDING') {
    throw new Error('VALIDATION_ITEM_INVALID_STATE');
  }

  await prisma.recommendationLetter.update({
    where: { id: letterId },
    data: {
      validationStatus: 'APPROVED',
      validatorUserId: actorUserId,
      validatedAt: new Date(),
      rejectionReason: null,
    },
  });

  const updatedLetter = await getRecommendationLetterValidationOrThrow(letterId);
  await notificationService.createAdminActionNotification({
    title: 'Validation approuvée',
    message: `La lettre de recommandation de ${
      updatedLetter.student?.user ? formatFullName(updatedLetter.student.user) : 'un étudiant'
    } a été approuvée.`,
    relatedType: 'RECOMMENDATION_LETTER_VALIDATION',
    relatedId: letterId,
  });

  return mapRecommendationLetterValidationItem(updatedLetter);
};

const rejectRecommendationLetterValidation = async (letterId, actorUserId, rejectionReason = null) => {
  const letter = await getRecommendationLetterValidationOrThrow(letterId);

  if (letter.validationStatus !== 'PENDING') {
    throw new Error('VALIDATION_ITEM_INVALID_STATE');
  }

  await prisma.recommendationLetter.update({
    where: { id: letterId },
    data: {
      validationStatus: 'REJECTED',
      validatorUserId: actorUserId,
      validatedAt: new Date(),
      rejectionReason,
    },
  });

  const updatedLetter = await getRecommendationLetterValidationOrThrow(letterId);
  await notificationService.createAdminActionNotification({
    title: 'Validation rejetée',
    message: `La lettre de recommandation de ${
      updatedLetter.student?.user ? formatFullName(updatedLetter.student.user) : 'un étudiant'
    } a été rejetée.`,
    relatedType: 'RECOMMENDATION_LETTER_VALIDATION',
    relatedId: letterId,
  });

  return mapRecommendationLetterValidationItem(updatedLetter);
};

const approveCommentValidation = async (commentId, actorUserId) => {
  const comment = await getCommentValidationOrThrow(commentId);

  if (comment.status !== 'PENDING') {
    throw new Error('VALIDATION_ITEM_INVALID_STATE');
  }

  await prisma.comment.update({
    where: { id: commentId },
    data: {
      status: 'APPROVED',
      validatorUserId: actorUserId,
      validatedAt: new Date(),
      rejectionReason: null,
    },
  });

  const updatedComment = await getCommentValidationOrThrow(commentId);
  await notificationService.createAdminActionNotification({
    title: 'Validation approuvée',
    message: `Le commentaire de ${
      updatedComment.authorUser ? formatFullName(updatedComment.authorUser) : 'un utilisateur'
    } a été approuvé.`,
    relatedType: 'COMMENT_VALIDATION',
    relatedId: commentId,
  });

  return mapCommentValidationItem(updatedComment);
};

const rejectCommentValidation = async (commentId, actorUserId, rejectionReason = null) => {
  const comment = await getCommentValidationOrThrow(commentId);

  if (comment.status !== 'PENDING') {
    throw new Error('VALIDATION_ITEM_INVALID_STATE');
  }

  await prisma.comment.update({
    where: { id: commentId },
    data: {
      status: 'REJECTED',
      validatorUserId: actorUserId,
      validatedAt: new Date(),
      rejectionReason,
    },
  });

  const updatedComment = await getCommentValidationOrThrow(commentId);
  await notificationService.createAdminActionNotification({
    title: 'Validation rejetée',
    message: `Le commentaire de ${
      updatedComment.authorUser ? formatFullName(updatedComment.authorUser) : 'un utilisateur'
    } a été rejeté.`,
    relatedType: 'COMMENT_VALIDATION',
    relatedId: commentId,
  });

  return mapCommentValidationItem(updatedComment);
};

const approveRecommendationValidation = async (recommendationId, actorUserId) => {
  const recommendation = await getRecommendationValidationOrThrow(recommendationId);

  if (recommendation.status !== 'PENDING') {
    throw new Error('VALIDATION_ITEM_INVALID_STATE');
  }

  await prisma.recommendation.update({
    where: { id: recommendationId },
    data: {
      status: 'APPROVED',
      validatorUserId: actorUserId,
      validatedAt: new Date(),
      rejectionReason: null,
    },
  });

  const updatedRecommendation = await getRecommendationValidationOrThrow(recommendationId);
  await notificationService.createAdminActionNotification({
    title: 'Validation approuvée',
    message: `La recommandation de ${
      updatedRecommendation.authorUser ? formatFullName(updatedRecommendation.authorUser) : 'un utilisateur'
    } a été approuvée.`,
    relatedType: 'RECOMMENDATION_VALIDATION',
    relatedId: recommendationId,
  });

  return mapRecommendationValidationItem(updatedRecommendation);
};

const rejectRecommendationValidation = async (recommendationId, actorUserId, rejectionReason = null) => {
  const recommendation = await getRecommendationValidationOrThrow(recommendationId);

  if (recommendation.status !== 'PENDING') {
    throw new Error('VALIDATION_ITEM_INVALID_STATE');
  }

  await prisma.recommendation.update({
    where: { id: recommendationId },
    data: {
      status: 'REJECTED',
      validatorUserId: actorUserId,
      validatedAt: new Date(),
      rejectionReason,
    },
  });

  const updatedRecommendation = await getRecommendationValidationOrThrow(recommendationId);
  await notificationService.createAdminActionNotification({
    title: 'Validation rejetée',
    message: `La recommandation de ${
      updatedRecommendation.authorUser ? formatFullName(updatedRecommendation.authorUser) : 'un utilisateur'
    } a été rejetée.`,
    relatedType: 'RECOMMENDATION_VALIDATION',
    relatedId: recommendationId,
  });

  return mapRecommendationValidationItem(updatedRecommendation);
};

const requestCertificateValidationChanges = async (certificateId, administratorId, comment = null) => {
  const certificate = await getValidationCertificateOrThrow(certificateId);

  if (certificate.validationStatus !== 'PENDING') {
    throw new Error('VALIDATION_ITEM_INVALID_STATE');
  }

  await prisma.$transaction(async (tx) => {
    await tx.certificate.update({
      where: { id: certificateId },
      data: { validationStatus: 'CHANGES_REQUESTED' },
    });

    await tx.certificateValidation.create({
      data: {
        certificateId,
        administratorId,
        decision: 'CHANGES_REQUESTED',
        comment,
      },
    });
  });

  const updatedCertificate = await getValidationCertificateOrThrow(certificateId);
  await notificationService.createAdminActionNotification({
    title: 'Correction demandée',
    message: `Une correction a été demandée pour le certificat de ${
      updatedCertificate.activity?.student?.user
        ? formatFullName(updatedCertificate.activity.student.user)
        : 'un étudiant'
    }.`,
    relatedType: 'CERTIFICATE_VALIDATION',
    relatedId: certificateId,
  });

  return mapCertificateRequestDetail(updatedCertificate);
};

const requestRecommendationLetterValidationChanges = async (letterId, actorUserId, comment = null) => {
  const letter = await getRecommendationLetterValidationOrThrow(letterId);

  if (letter.validationStatus !== 'PENDING') {
    throw new Error('VALIDATION_ITEM_INVALID_STATE');
  }

  await prisma.recommendationLetter.update({
    where: { id: letterId },
    data: {
      validationStatus: 'CHANGES_REQUESTED',
      validatorUserId: actorUserId,
      validatedAt: new Date(),
      rejectionReason: comment,
    },
  });

  const updatedLetter = await getRecommendationLetterValidationOrThrow(letterId);
  await notificationService.createAdminActionNotification({
    title: 'Correction demandée',
    message: `Une correction a été demandée pour la lettre de recommandation de ${
      updatedLetter.student?.user ? formatFullName(updatedLetter.student.user) : 'un étudiant'
    }.`,
    relatedType: 'RECOMMENDATION_LETTER_VALIDATION',
    relatedId: letterId,
  });

  return mapRecommendationLetterValidationItem(updatedLetter);
};

const requestCommentValidationChanges = async (commentId, actorUserId, commentText = null) => {
  const comment = await getCommentValidationOrThrow(commentId);

  if (comment.status !== 'PENDING') {
    throw new Error('VALIDATION_ITEM_INVALID_STATE');
  }

  await prisma.comment.update({
    where: { id: commentId },
    data: {
      status: 'CHANGES_REQUESTED',
      validatorUserId: actorUserId,
      validatedAt: new Date(),
      rejectionReason: commentText,
    },
  });

  const updatedComment = await getCommentValidationOrThrow(commentId);
  await notificationService.createAdminActionNotification({
    title: 'Correction demandée',
    message: `Une correction a été demandée pour le commentaire de ${
      updatedComment.authorUser ? formatFullName(updatedComment.authorUser) : 'un utilisateur'
    }.`,
    relatedType: 'COMMENT_VALIDATION',
    relatedId: commentId,
  });

  return mapCommentValidationItem(updatedComment);
};

const requestRecommendationValidationChanges = async (recommendationId, actorUserId, comment = null) => {
  const recommendation = await getRecommendationValidationOrThrow(recommendationId);

  if (recommendation.status !== 'PENDING') {
    throw new Error('VALIDATION_ITEM_INVALID_STATE');
  }

  await prisma.recommendation.update({
    where: { id: recommendationId },
    data: {
      status: 'CHANGES_REQUESTED',
      validatorUserId: actorUserId,
      validatedAt: new Date(),
      rejectionReason: comment,
    },
  });

  const updatedRecommendation = await getRecommendationValidationOrThrow(recommendationId);
  await notificationService.createAdminActionNotification({
    title: 'Correction demandée',
    message: `Une correction a été demandée pour la recommandation de ${
      updatedRecommendation.authorUser ? formatFullName(updatedRecommendation.authorUser) : 'un utilisateur'
    }.`,
    relatedType: 'RECOMMENDATION_VALIDATION',
    relatedId: recommendationId,
  });

  return mapRecommendationValidationItem(updatedRecommendation);
};

exports.getDashboardData = async () => {
  await syncAdminNotifications();

  const [
    totalUsers,
    totalStudents,
    totalProfessors,
    pendingRequests,
    pendingValidationCounts,
    pendingReports,
    recentRequests,
  ] = await Promise.all([
    safeCount(() => prisma.user.count()),
    safeCount(() => prisma.user.count({ where: { role: 'STUDENT' } })),
    safeCount(() => prisma.user.count({ where: { role: 'PROFESSOR' } })),
    safeCount(() =>
      prisma.user.count({
        where: {
          role: 'PROFESSIONAL',
          accountStatus: 'PENDING',
        },
      }),
    ),
    getPendingValidationCounts(),
    safeCount(() => prisma.report.count({ where: { status: 'PENDING' } })),
    getRecentDashboardRequests(),
  ]);

  return {
    summaryCards: {
      totalUsers: { value: totalUsers, variation: 'Comptes enregistrés' },
      totalStudents: { value: totalStudents, variation: 'Profils étudiants' },
      totalProfessors: {
        value: totalProfessors,
        variation: 'Profils professeurs',
      },
      pendingRequests: {
        value: pendingRequests,
        variation: 'Demandes professionnelles',
      },
    },
    urgentActions: {
      pendingAccessRequests: pendingRequests,
      pendingValidations: pendingValidationCounts.total,
      reports: pendingReports,
    },
    recentRequests,
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

exports.listBadges = async ({ page = 1, limit = 10, search } = {}) => {
  const { skip, page: safePage, limit: safeLimit } = normalizePagination(page, limit);

  if (!hasBadgeFeature()) {
    return {
      items: [],
      pagination: buildPagination(safePage, safeLimit, 0),
    };
  }

  const where = search
    ? {
        OR: buildBadgeSearch(search),
      }
    : undefined;

  try {
    const [total, badges] = await Promise.all([
      prisma.badge.count({ where }),
      prisma.badge.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { name: 'asc' }],
        skip,
        take: safeLimit,
        select: badgeSelect,
      }),
    ]);

    return {
      items: badges.map(mapBadgeItem),
      pagination: buildPagination(safePage, safeLimit, total),
    };
  } catch (err) {
    if (isStructureMissingError(err)) {
      return {
        items: [],
        pagination: buildPagination(safePage, safeLimit, 0),
      };
    }

    throw err;
  }
};

const getProjectValidationOrThrow = async (projectId) => {
  const project = await safeReadWithFallback(
    () =>
      prisma.project.findUnique({
        where: { id: projectId },
        select: projectValidationSelect,
      }),
    null,
    null,
  );

  if (!project) {
    throw new Error('VALIDATION_ITEM_NOT_FOUND');
  }

  return project;
};

const getInternshipValidationOrThrow = async (internshipId) => {
  const internship = await safeReadWithFallback(
    () =>
      prisma.internship.findUnique({
        where: { id: internshipId },
        select: internshipValidationSelect,
      }),
    null,
    null,
  );

  if (!internship) {
    throw new Error('VALIDATION_ITEM_NOT_FOUND');
  }

  return internship;
};

exports.createBadge = async (payload = {}) => {
  const name = normalizeRequiredText(payload.name);
  const rule = normalizeRequiredText(payload.rule);

  if (!name || !rule) {
    throw new Error('BADGE_REQUIRED_FIELDS');
  }

  await ensureUniqueBadgeName(name);

  try {
    const badge = await ensureBadgeFeatureAvailable().create({
      data: {
        name,
        description: normalizeOptionalText(payload.description),
        rule,
        iconUrl: normalizeOptionalText(payload.iconUrl),
        tone: normalizeBadgeTone(payload.tone),
      },
      select: badgeSelect,
    });

    return mapBadgeItem(badge);
  } catch (err) {
    if (isStructureMissingError(err)) {
      throw new Error('BADGE_FEATURE_UNAVAILABLE', { cause: err });
    }

    if (err?.code === 'P2002') {
      throw new Error('BADGE_NAME_ALREADY_EXISTS', { cause: err });
    }

    throw err;
  }
};

exports.updateBadge = async (badgeId, payload = {}) => {
  const existingBadge = await getBadgeOrThrow(badgeId);

  const nextName = Object.prototype.hasOwnProperty.call(payload, 'name')
    ? normalizeRequiredText(payload.name)
    : existingBadge.name;
  const nextRule = Object.prototype.hasOwnProperty.call(payload, 'rule')
    ? normalizeRequiredText(payload.rule)
    : existingBadge.rule;

  if (!nextName || !nextRule) {
    throw new Error('BADGE_REQUIRED_FIELDS');
  }

  await ensureUniqueBadgeName(nextName, badgeId);

  try {
    const updatedBadge = await ensureBadgeFeatureAvailable().update({
      where: { id: badgeId },
      data: {
        name: nextName,
        description: Object.prototype.hasOwnProperty.call(payload, 'description')
          ? normalizeOptionalText(payload.description)
          : existingBadge.description,
        rule: nextRule,
        iconUrl: Object.prototype.hasOwnProperty.call(payload, 'iconUrl')
          ? normalizeOptionalText(payload.iconUrl)
          : existingBadge.iconUrl,
        tone: Object.prototype.hasOwnProperty.call(payload, 'tone')
          ? normalizeBadgeTone(payload.tone)
          : existingBadge.tone,
      },
      select: badgeSelect,
    });

    return mapBadgeItem(updatedBadge);
  } catch (err) {
    if (isStructureMissingError(err)) {
      throw new Error('BADGE_FEATURE_UNAVAILABLE', { cause: err });
    }

    if (err?.code === 'P2025') {
      throw new Error('BADGE_NOT_FOUND', { cause: err });
    }

    if (err?.code === 'P2002') {
      throw new Error('BADGE_NAME_ALREADY_EXISTS', { cause: err });
    }

    throw err;
  }
};

exports.deleteBadge = async (badgeId) => {
  await getBadgeOrThrow(badgeId);

  try {
    await ensureBadgeFeatureAvailable().delete({
      where: { id: badgeId },
    });
  } catch (err) {
    if (isStructureMissingError(err)) {
      throw new Error('BADGE_FEATURE_UNAVAILABLE', { cause: err });
    }

    if (err?.code === 'P2025') {
      throw new Error('BADGE_NOT_FOUND', { cause: err });
    }

    throw err;
  }

  return {
    id: badgeId,
    deleted: true,
  };
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
  const email = normalizeEmail(payload.email);

  ensureValidRole(role);
  ensureValidStatus(accountStatus);

  if (!payload.firstName || !payload.lastName || !email) {
    throw new Error('MISSING_REQUIRED_FIELDS');
  }

  const existingUser = await findUserByEmail(email);

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
      email,
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
    await prisma.user.delete({
      where: { id: createdUser.id },
    });

    throw new Error('USER_EMAIL_SEND_FAILED', { cause: err });
  }

  return {
    user: mapUserSummary(createdUser),
    temporaryPassword: providedPassword ? null : initialPassword,
    credentialsSent: true,
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
    email: normalizeEmail(payload.email),
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
      throw new Error('USER_DELETE_BLOCKED_BY_RELATED_DATA', { cause: err });
    }

    throw err;
  }

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
    safeCount(() => prisma.user.count({ where })),
    getProfessionalRequestsList(where, skip, safeLimit),
  ]);

  return {
    items: requests.map(mapProfessionalRequestDetail),
    pagination: buildPagination(safePage, safeLimit, total),
  };
};

exports.getProfessionalRequest = async (userId) => {
  const request = await getProfessionalRequestOrThrow(userId);
  return mapProfessionalRequestDetail(request);
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

  const updatedRequest = await exports.getProfessionalRequest(userId);
  await notificationService.createAdminActionNotification({
    title: "Demande d'accès approuvée",
    message: `La demande d'accès de ${updatedRequest.requesterName} a été approuvée.`,
    relatedType: 'ACCESS_REQUEST',
    relatedId: userId,
  });

  return updatedRequest;
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

  const updatedRequest = await exports.getProfessionalRequest(userId);
  await notificationService.createAdminActionNotification({
    title: "Demande d'accès rejetée",
    message: `La demande d'accès de ${updatedRequest.requesterName} a été rejetée.`,
    relatedType: 'ACCESS_REQUEST',
    relatedId: userId,
  });

  return updatedRequest;
};

const buildValidationItems = async ({ type, status = 'PENDING', search } = {}) => {
  await syncPendingValidationNotifications();

  const normalizedType = type ? normalizeValidationType(type) : null;

  if (normalizedType) {
    ensureValidValidationType(normalizedType);
  }

  const loaders = [];

  if (!normalizedType || normalizedType === 'PROJECT') {
    loaders.push(loadProjectValidationItems(status).then((items) => items.map(mapProjectValidationItem)));
  }

  if (!normalizedType || normalizedType === 'INTERNSHIP') {
    loaders.push(loadInternshipValidationItems(status).then((items) => items.map(mapInternshipValidationItem)));
  }

  if (!normalizedType || normalizedType === 'CERTIFICATE_VALIDATION') {
    loaders.push(loadCertificateValidationItems(status).then((items) => items.map(mapCertificateRequestDetail)));
  }

  if (!normalizedType || normalizedType === 'RECOMMENDATION_LETTER_VALIDATION') {
    loaders.push(
      loadRecommendationLetterValidationItems(status).then((items) => items.map(mapRecommendationLetterValidationItem)),
    );
  }

  if (!normalizedType || normalizedType === 'COMMENT_VALIDATION') {
    loaders.push(loadCommentValidationItems(status).then((items) => items.map(mapCommentValidationItem)));
  }

  if (!normalizedType || normalizedType === 'RECOMMENDATION_VALIDATION') {
    loaders.push(loadRecommendationValidationItems(status).then((items) => items.map(mapRecommendationValidationItem)));
  }

  const mergedItems = (await Promise.all(loaders))
    .flat()
    .filter((item) => matchesValidationSearch(item, search))
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

  return {
    type: normalizedType,
    items: mergedItems,
  };
};

exports.listValidationItems = async ({ type, status = 'PENDING', page = 1, limit = 10, search } = {}) => {
  const { type: normalizedType, items } = await buildValidationItems({
    type,
    status,
    search,
  });
  const paginated = paginateItems(items, page, limit);

  return {
    filters: {
      type: normalizedType,
      status,
      search: search || null,
    },
    ...paginated,
  };
};

exports.listPendingValidationsLegacy = async ({ type, status = 'PENDING', page = 1, limit = 10, search } = {}) => {
  const normalizedLegacyType = type ? normalizeLegacyValidationType(type) : null;

  if (normalizedLegacyType) {
    ensureValidLegacyValidationType(normalizedLegacyType);
  }

  if (normalizedLegacyType === 'PROJECT' || normalizedLegacyType === 'INTERNSHIP') {
    const { items } = await buildValidationItems({
      type: normalizedLegacyType,
      status,
      search,
    });
    const paginated = paginateItems(items.map(mapValidationItemToLegacyShape), page, limit);

    return {
      filters: {
        type: normalizedLegacyType,
        status,
        search: search || null,
      },
      ...paginated,
    };
  }

  const mappedType = normalizedLegacyType === 'CERTIFICATE' ? 'CERTIFICATE_VALIDATION' : null;
  const { items } = await buildValidationItems({
    type: mappedType,
    status,
    search,
  });

  const legacyItems = items
    .map(mapValidationItemToLegacyShape)
    .filter((item) => !normalizedLegacyType || item.targetType === normalizedLegacyType);
  const paginated = paginateItems(legacyItems, page, limit);

  return {
    filters: {
      type: normalizedLegacyType,
      status,
      search: search || null,
    },
    ...paginated,
  };
};

exports.getPendingValidationCountsLegacy = async () =>
  mapLegacyPendingValidationCounts(await getPendingValidationCounts());

exports.getValidationItemDetail = async (itemType, itemId) => {
  const normalizedType = normalizeValidationType(itemType);
  ensureValidValidationType(normalizedType);

  switch (normalizedType) {
    case 'PROJECT':
      return mapProjectValidationItem(await getProjectValidationOrThrow(itemId));

    case 'INTERNSHIP':
      return mapInternshipValidationItem(await getInternshipValidationOrThrow(itemId));

    case 'CERTIFICATE_VALIDATION':
      return mapCertificateRequestDetail(await getValidationCertificateOrThrow(itemId));

    case 'RECOMMENDATION_LETTER_VALIDATION':
      return mapRecommendationLetterValidationItem(await getRecommendationLetterValidationOrThrow(itemId));

    case 'COMMENT_VALIDATION':
      return mapCommentValidationItem(await getCommentValidationOrThrow(itemId));

    case 'RECOMMENDATION_VALIDATION':
      return mapRecommendationValidationItem(await getRecommendationValidationOrThrow(itemId));

    default:
      throw new Error('UNSUPPORTED_VALIDATION_TYPE');
  }
};

exports.getLegacyValidationDetail = async (itemId) => {
  const itemType = await resolveValidationItemTypeById(itemId);
  return mapValidationItemToLegacyShape(await exports.getValidationItemDetail(itemType, itemId));
};

exports.approveValidationItem = async (itemType, itemId, actorUserId, administratorId, payload = {}) => {
  const normalizedType = normalizeValidationType(itemType);
  ensureValidValidationType(normalizedType);

  switch (normalizedType) {
    case 'PROJECT':
      return approveProjectValidation(itemId, readTextValue(payload, ['comment']));

    case 'INTERNSHIP':
      return approveInternshipValidation(itemId);

    case 'CERTIFICATE_VALIDATION':
      try {
        return await approveCertificateRequest(itemId, administratorId, readTextValue(payload, ['comment']));
      } catch (err) {
        if (err.message === 'DASHBOARD_ITEM_NOT_FOUND') {
          throw new Error('VALIDATION_ITEM_NOT_FOUND', { cause: err });
        }

        throw err;
      }

    case 'RECOMMENDATION_LETTER_VALIDATION':
      return approveRecommendationLetterValidation(itemId, actorUserId);

    case 'COMMENT_VALIDATION':
      return approveCommentValidation(itemId, actorUserId);

    case 'RECOMMENDATION_VALIDATION':
      return approveRecommendationValidation(itemId, actorUserId);

    default:
      throw new Error('UNSUPPORTED_VALIDATION_TYPE');
  }
};

exports.rejectValidationItem = async (itemType, itemId, actorUserId, administratorId, payload = {}) => {
  const normalizedType = normalizeValidationType(itemType);
  ensureValidValidationType(normalizedType);

  const normalizedReason = readTextValue(payload, ['comment', 'rejectionReason', 'reason']);

  switch (normalizedType) {
    case 'PROJECT':
      return rejectProjectValidation(itemId, normalizedReason);

    case 'INTERNSHIP':
      return rejectInternshipValidation(itemId);

    case 'CERTIFICATE_VALIDATION':
      try {
        return await rejectCertificateRequest(itemId, administratorId, normalizedReason);
      } catch (err) {
        if (err.message === 'DASHBOARD_ITEM_NOT_FOUND') {
          throw new Error('VALIDATION_ITEM_NOT_FOUND', { cause: err });
        }

        throw err;
      }

    case 'RECOMMENDATION_LETTER_VALIDATION':
      return rejectRecommendationLetterValidation(itemId, actorUserId, normalizedReason);

    case 'COMMENT_VALIDATION':
      return rejectCommentValidation(itemId, actorUserId, normalizedReason);

    case 'RECOMMENDATION_VALIDATION':
      return rejectRecommendationValidation(itemId, actorUserId, normalizedReason);

    default:
      throw new Error('UNSUPPORTED_VALIDATION_TYPE');
  }
};

exports.requestValidationChangesItem = async (itemType, itemId, actorUserId, administratorId, payload = {}) => {
  const normalizedType = normalizeValidationType(itemType);
  ensureValidValidationType(normalizedType);

  const normalizedComment = readTextValue(payload, ['comment', 'rejectionReason', 'reason']);

  switch (normalizedType) {
    case 'PROJECT':
      return requestProjectValidationChanges(itemId, normalizedComment);

    case 'INTERNSHIP':
      return requestInternshipValidationChanges(itemId);

    case 'CERTIFICATE_VALIDATION':
      return requestCertificateValidationChanges(itemId, administratorId, normalizedComment);

    case 'RECOMMENDATION_LETTER_VALIDATION':
      return requestRecommendationLetterValidationChanges(itemId, actorUserId, normalizedComment);

    case 'COMMENT_VALIDATION':
      return requestCommentValidationChanges(itemId, actorUserId, normalizedComment);

    case 'RECOMMENDATION_VALIDATION':
      return requestRecommendationValidationChanges(itemId, actorUserId, normalizedComment);

    default:
      throw new Error('UNSUPPORTED_VALIDATION_TYPE');
  }
};

exports.resetUserPassword = async (userId) => {
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

exports.approveLegacyValidationItem = async (itemId, actorUserId, administratorId, payload = {}) => {
  const itemType = await resolveValidationItemTypeById(itemId);
  return exports.approveValidationItem(itemType, itemId, actorUserId, administratorId, payload);
};

exports.rejectLegacyValidationItem = async (itemId, actorUserId, administratorId, payload = {}) => {
  const itemType = await resolveValidationItemTypeById(itemId);
  return exports.rejectValidationItem(itemType, itemId, actorUserId, administratorId, payload);
};

exports.requestLegacyValidationChanges = async (itemId, actorUserId, administratorId, payload = {}) => {
  const itemType = await resolveValidationItemTypeById(itemId);
  const updatedItem = await exports.requestValidationChangesItem(
    itemType,
    itemId,
    actorUserId,
    administratorId,
    payload,
  );

  return mapValidationItemToLegacyShape(updatedItem);
};

exports.listNotifications = async ({ administratorId, type, isRead, page = 1, limit = 10, search } = {}) => {
  await syncAdminNotifications();

  const normalizedType = type ? normalizeValidationType(type) : null;

  if (normalizedType) {
    ensureValidNotificationType(normalizedType);
  }

  const { skip, page: safePage, limit: safeLimit } = normalizePagination(page, limit);
  const normalizedSearch = String(search || '').trim();

  const scopeConditions = administratorId
    ? [{ OR: [{ administratorId }, { administratorId: null }] }]
    : [{ administratorId: null }];

  const where = {
    ...(normalizedType ? { type: getNotificationFilterByType(normalizedType) } : {}),
    ...(typeof isRead === 'boolean' ? { isRead } : {}),
    ...(scopeConditions.length || normalizedSearch
      ? {
          AND: [
            ...scopeConditions,
            ...(normalizedSearch
              ? [
                  {
                    OR: [
                      {
                        title: {
                          contains: normalizedSearch,
                          mode: 'insensitive',
                        },
                      },
                      {
                        message: {
                          contains: normalizedSearch,
                          mode: 'insensitive',
                        },
                      },
                      {
                        relatedType: {
                          contains: normalizedSearch,
                          mode: 'insensitive',
                        },
                      },
                    ],
                  },
                ]
              : []),
          ],
        }
      : {}),
  };

  const [total, unreadCount, allCount, notifications] = await Promise.all([
    safeCount(() => prisma.notification.count({ where })),
    safeCount(() =>
      prisma.notification.count({
        where: {
          ...(scopeConditions.length
            ? {
                AND: scopeConditions,
              }
            : {}),
          isRead: false,
        },
      }),
    ),
    safeCount(() =>
      prisma.notification.count({
        where: scopeConditions.length
          ? {
              AND: scopeConditions,
            }
          : undefined,
      }),
    ),
    safeReadWithFallback(
      () =>
        prisma.notification.findMany({
          where,
          orderBy: [{ createdAt: 'desc' }],
          skip,
          take: safeLimit,
          select: notificationSelect,
        }),
      null,
      [],
    ),
  ]);

  return {
    filters: {
      type: normalizedType,
      isRead: typeof isRead === 'boolean' ? isRead : null,
      search: normalizedSearch || null,
    },
    summary: {
      total: allCount,
      unread: unreadCount,
      read: Math.max(0, allCount - unreadCount),
    },
    items: notifications.map(mapNotificationItem),
    pagination: buildPagination(safePage, safeLimit, total),
  };
};

exports.getUnreadNotificationsCount = async (administratorId) => {
  const scopeConditions = administratorId
    ? [{ OR: [{ administratorId }, { administratorId: null }] }]
    : [{ administratorId: null }];

  return safeCount(() =>
    prisma.notification.count({
      where: {
        isRead: false,
        ...(scopeConditions.length
          ? {
              AND: scopeConditions,
            }
          : {}),
      },
    }),
  );
};

exports.markNotificationAsRead = async (notificationId, administratorId) => {
  await getNotificationOrThrow(notificationId, administratorId);

  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  } catch (err) {
    if (isStructureMissingError(err)) {
      throw new Error('NOTIFICATION_NOT_FOUND', { cause: err });
    }

    throw err;
  }

  return mapNotificationItem(await getNotificationOrThrow(notificationId, administratorId));
};

exports.deleteNotification = async (notificationId, administratorId) => {
  await getNotificationOrThrow(notificationId, administratorId);

  try {
    await prisma.notification.delete({
      where: { id: notificationId },
    });
  } catch (err) {
    if (isStructureMissingError(err) || err?.code === 'P2025') {
      throw new Error('NOTIFICATION_NOT_FOUND', { cause: err });
    }

    throw err;
  }

  return {
    id: notificationId,
    deleted: true,
  };
};

exports.markAllNotificationsAsRead = async (administratorId) => {
  const scopeConditions = administratorId
    ? [{ OR: [{ administratorId }, { administratorId: null }] }]
    : [{ administratorId: null }];

  const now = new Date();

  try {
    const result = await prisma.notification.updateMany({
      where: {
        isRead: false,
        ...(scopeConditions.length
          ? {
              AND: scopeConditions,
            }
          : {}),
      },
      data: {
        isRead: true,
        readAt: now,
      },
    });

    return {
      updatedCount: result.count,
      readAt: now,
    };
  } catch (err) {
    if (isStructureMissingError(err)) {
      return {
        updatedCount: 0,
        readAt: now,
      };
    }

    throw err;
  }
};

exports.listReports = async ({ status = 'PENDING', targetType, page = 1, limit = 10, search } = {}) => {
  await syncPendingReportNotifications();

  const normalizedTargetType = targetType ? String(targetType).trim().toUpperCase().replace(/-/g, '_') : null;
  const normalizedStatus = status ? String(status).trim().toUpperCase() : null;

  if (normalizedStatus) {
    ensureValidReportStatus(normalizedStatus);
  }

  if (normalizedTargetType) {
    ensureValidReportTargetType(normalizedTargetType);
  }

  const reports = await loadReportItems(normalizedStatus, normalizedTargetType);
  const filteredReports = reports.map(mapReportItem).filter((item) => matchesValidationSearch(item, search));

  const paginated = paginateItems(filteredReports, page, limit);

  return {
    filters: {
      status: normalizedStatus,
      targetType: normalizedTargetType,
      search: search || null,
    },
    ...paginated,
  };
};

exports.getPendingReportsCount = async () =>
  safeCount(() =>
    prisma.report.count({
      where: { status: 'PENDING' },
    }),
  );

exports.getReportById = async (reportId) => mapReportItem(await getReportOrThrow(reportId));

exports.approveReport = async (reportId, administratorId, resolutionNote = null) => {
  const report = await getReportOrThrow(reportId);

  if (report.status !== 'PENDING') {
    throw new Error('REPORT_INVALID_STATE');
  }

  await prisma.report.update({
    where: { id: reportId },
    data: {
      status: 'APPROVED',
      reviewedByAdministratorId: administratorId,
      reviewedAt: new Date(),
      resolutionNote,
    },
  });

  const updatedReport = await exports.getReportById(reportId);
  await notificationService.createAdminActionNotification({
    title: 'Signalement approuve',
    message: `Le signalement lié à ${report.targetType.toLowerCase()} a été approuvé.`,
    relatedType: 'REPORT',
    relatedId: reportId,
  });

  return updatedReport;
};

exports.resolveReportLegacy = async (reportId, administratorId, resolutionNote = null) =>
  exports.approveReport(reportId, administratorId, resolutionNote || 'Signalement marqué comme traité.');

exports.rejectReport = async (reportId, administratorId, resolutionNote = null) => {
  const report = await getReportOrThrow(reportId);

  if (report.status !== 'PENDING') {
    throw new Error('REPORT_INVALID_STATE');
  }

  await prisma.report.update({
    where: { id: reportId },
    data: {
      status: 'REJECTED',
      reviewedByAdministratorId: administratorId,
      reviewedAt: new Date(),
      resolutionNote,
    },
  });

  const updatedReport = await exports.getReportById(reportId);
  await notificationService.createAdminActionNotification({
    title: 'Signalement rejete',
    message: `Le signalement lié à ${report.targetType.toLowerCase()} a été rejeté.`,
    relatedType: 'REPORT',
    relatedId: reportId,
  });

  return updatedReport;
};

exports.deleteReportedTarget = async (reportId, administratorId, resolutionNote = null) => {
  const report = await getReportOrThrow(reportId);

  if (report.status !== 'PENDING') {
    throw new Error('REPORT_INVALID_STATE');
  }

  const reviewedAt = new Date();
  let deletionOutcome = 'resolved_without_target_deletion';
  let appliedResolutionNote = resolutionNote;

  await prisma.$transaction(async (tx) => {
    deletionOutcome = await deleteReportTargetRecord(tx, report);

    if (!appliedResolutionNote) {
      appliedResolutionNote =
        deletionOutcome === 'deleted'
          ? 'Contenu signalé supprimé.'
          : 'Signalement traité sans suppression automatique de la cible.';
    }

    await tx.report.update({
      where: { id: reportId },
      data: {
        status: 'APPROVED',
        reviewedByAdministratorId: administratorId,
        reviewedAt,
        resolutionNote: appliedResolutionNote,
      },
    });
  });

  const updatedReport = await exports.getReportById(reportId);
  await notificationService.createAdminActionNotification({
    title: deletionOutcome === 'deleted' ? 'Contenu signalé supprimé' : 'Signalement traité',
    message:
      deletionOutcome === 'deleted'
        ? `Le contenu signalé lié à ${report.targetType.toLowerCase()} a été supprimé.`
        : `Le signalement lié à ${report.targetType.toLowerCase()} a été traité sans suppression automatique de la cible.`,
    relatedType: 'REPORT',
    relatedId: reportId,
  });

  return updatedReport;
};

exports.getDashboardItemDetail = async (itemType, itemId) => {
  const normalizedType = String(itemType || '')
    .trim()
    .toUpperCase()
    .replace(/-/g, '_');

  switch (normalizedType) {
    case 'ACCESS_REQUEST': {
      const request = await getProfessionalRequestOrThrow(itemId);
      return mapProfessionalRequestDetail(request);
    }

    case 'CERTIFICATE_VALIDATION': {
      const certificate = await getCertificateRequestOrThrow(itemId);
      return mapCertificateRequestDetail(certificate);
    }

    case 'REPORT':
      return exports.getReportById(itemId);

    default:
      throw new Error('UNSUPPORTED_DASHBOARD_ITEM_TYPE');
  }
};

exports.approveDashboardItem = async (itemType, itemId, administratorId, payload = {}) => {
  const normalizedType = String(itemType || '')
    .trim()
    .toUpperCase()
    .replace(/-/g, '_');

  switch (normalizedType) {
    case 'ACCESS_REQUEST':
      return exports.approveProfessionalRequest(itemId, administratorId);

    case 'CERTIFICATE_VALIDATION':
      return approveCertificateRequest(itemId, administratorId, readTextValue(payload, ['comment']));

    case 'REPORT':
      return exports.approveReport(itemId, administratorId, readTextValue(payload, ['resolutionNote', 'comment']));

    default:
      throw new Error('UNSUPPORTED_DASHBOARD_ACTION_TYPE');
  }
};

exports.rejectDashboardItem = async (itemType, itemId, administratorId, payload = {}) => {
  const normalizedType = String(itemType || '')
    .trim()
    .toUpperCase()
    .replace(/-/g, '_');

  const normalizedComment = readTextValue(payload, ['comment', 'rejectionReason', 'reason']);

  switch (normalizedType) {
    case 'ACCESS_REQUEST':
      return exports.rejectProfessionalRequest(itemId, administratorId, normalizedComment);

    case 'CERTIFICATE_VALIDATION':
      return rejectCertificateRequest(itemId, administratorId, normalizedComment);

    case 'REPORT':
      return exports.rejectReport(itemId, administratorId, normalizedComment);

    default:
      throw new Error('UNSUPPORTED_DASHBOARD_ACTION_TYPE');
  }
};
