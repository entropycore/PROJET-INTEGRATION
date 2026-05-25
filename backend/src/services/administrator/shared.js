'use strict';

// Helpers Prisma communs aux services admin. La logique metier lisible
// est repartie dans les fichiers *Service.js du meme dossier.

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const prisma = require('../../config/prisma');
const notificationService = require('../notificationService');
const {
  professionalRequestSelect,
  professionalRequestLegacySelect,
  recentCertificateSelect,
  reportSelect,
  notificationSelect,
  recommendationLetterValidationSelect,
  commentValidationSelect,
  recommendationValidationSelect,
  userSelect,
} = require('./selects');
const {
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
} = require('./mappers');

const USER_ROLES = ['STUDENT', 'PROFESSOR', 'ADMINISTRATOR', 'PROFESSIONAL'];
const ACCOUNT_STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'];
const VALIDATION_ITEM_TYPES = [
  'CERTIFICATE_VALIDATION',
  'RECOMMENDATION_LETTER_VALIDATION',
  'COMMENT_VALIDATION',
  'RECOMMENDATION_VALIDATION',
];
const NOTIFICATION_TYPES = [
  'ACCESS_REQUEST',
  'CERTIFICATE_VALIDATION',
  'RECOMMENDATION_LETTER_VALIDATION',
  'COMMENT_VALIDATION',
  'RECOMMENDATION_VALIDATION',
  'REPORT',
  'SYSTEM',
];
const REPORT_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];
const REPORT_TARGET_TYPES = ['PORTFOLIO', 'COMMENT', 'RECOMMENDATION', 'PROJECT', 'INTERNSHIP', 'USER', 'OTHER'];
const BCRYPT_ROUNDS = 10;

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

const ensureValidNotificationType = (type) => {
  if (!NOTIFICATION_TYPES.includes(type)) {
    throw new Error('INVALID_NOTIFICATION_TYPE');
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

const paginateItems = (items, page = 1, limit = 10) => {
  const { page: safePage, limit: safeLimit, skip } = normalizePagination(page, limit);

  return {
    items: items.slice(skip, skip + safeLimit),
    pagination: buildPagination(safePage, safeLimit, items.length),
  };
};

const normalizeSearch = (value) => String(value || '').trim().toLowerCase();

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

const getNotificationTone = (type, relatedType = null) => {
  const effectiveType = relatedType || type;

  switch (effectiveType) {
    case 'ACCESS_REQUEST':
      return 'orange';
    case 'REPORT':
      return 'red';
    case 'SYSTEM':
      return 'blue';
    default:
      return 'green';
  }
};

const getNotificationLink = (type, relatedType = null) => {
  const effectiveType = relatedType || type;

  switch (effectiveType) {
    case 'ACCESS_REQUEST':
      return '/admin/dashboard';
    case 'REPORT':
      return '/admin/reports';
    case 'CERTIFICATE_VALIDATION':
    case 'RECOMMENDATION_LETTER_VALIDATION':
    case 'COMMENT_VALIDATION':
    case 'RECOMMENDATION_VALIDATION':
      return '/admin/validations';
    default:
      return '/admin/notifications';
  }
};

const mapNotificationItem = (notification) => ({
  id: notification.id,
  type: notification.type,
  title: notification.title,
  message: notification.message,
  read: notification.isRead,
  isRead: notification.isRead,
  createdAt: notification.createdAt,
  readAt: notification.readAt,
  tone: getNotificationTone(notification.type, notification.relatedType),
  link: getNotificationLink(notification.type, notification.relatedType),
  target:
    notification.relatedId && (notification.relatedType || notification.type)
      ? {
          itemType: notification.relatedType || notification.type,
          itemId: notification.relatedId,
        }
      : null,
  raw: {
    administratorId: notification.administratorId,
    relatedType: notification.relatedType,
    relatedId: notification.relatedId,
  },
});

const buildProfessionalProfileData = (payload, accountStatus) => {
  const isPendingApproval = accountStatus === 'PENDING';
  const now = new Date();

  return {
    company: payload.company || null,
    jobTitle: payload.jobTitle || null,
    sector: payload.sector || null,
    bio: payload.bio || null,
    // An admin-created professional does not go through the public email verification flow.
    isEmailVerified: true,
    emailVerifiedAt: now,
    // Pending accounts still require explicit admin approval before activation.
    isVerified: !isPendingApproval,
    approvedAt: isPendingApproval ? null : now,
  };
};

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
      return {
        professional: {
          create: buildProfessionalProfileData(payload, accountStatus),
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

const certificateDetailSelect = {
  id: true,
  validationStatus: true,
  submittedAt: true,
  documentUrl: true,
  activity: {
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      organization: true,
      startDate: true,
      endDate: true,
      student: {
        select: {
          id: true,
          apogeeCode: true,
          cne: true,
          major: true,
          level: true,
          city: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              profilePicture: true,
            },
          },
        },
      },
    },
  },
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
    null
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
    null
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
      throw new Error('VALIDATION_ITEM_NOT_FOUND');
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
    null
  );

  if (!report) {
    throw new Error('REPORT_NOT_FOUND');
  }

  return report;
};

const getNotificationOrThrow = async (notificationId, administratorId = null) => {
  const scopeConditions = administratorId
    ? [{ OR: [{ administratorId }, { administratorId: null }] }]
    : [];

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
    null
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
    null
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
    null
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
    null
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

const buildTemporaryPassword = () => {
  const suffix = crypto.randomBytes(4).toString('hex');
  return `Temp${suffix}Aa!1`;
};

const getPendingValidationCounts = async () => {
  const [
    pendingCertificates,
    pendingLetters,
    pendingComments,
    pendingRecommendations,
  ] = await Promise.all([
    safeCount(() => prisma.certificate.count({ where: { validationStatus: 'PENDING' } })),
    safeCount(() => prisma.recommendationLetter.count({ where: { validationStatus: 'PENDING' } })),
    safeCount(() => prisma.comment.count({ where: { status: 'PENDING' } })),
    safeCount(() => prisma.recommendation.count({ where: { status: 'PENDING' } })),
  ]);

  return {
    pendingCertificates,
    pendingLetters,
    pendingComments,
    pendingRecommendations,
    total:
      pendingCertificates +
      pendingLetters +
      pendingComments +
      pendingRecommendations,
  };
};

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
    []
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
    []
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
    []
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
    []
  );

  await Promise.all(
    requests.map((request) =>
      notificationService.ensurePendingItemNotification(mapDashboardAccessRequest(request))
    )
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

  await Promise.all(
    reports.map((report) =>
      notificationService.ensurePendingItemNotification(mapReportItem(report))
    )
  );
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
    []
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
    []
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
    []
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
    []
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
    []
  );

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
    []
  );

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
    title: 'Validation approuvee',
    message: `La validation du certificat de ${
      updatedCertificate.activity?.student?.user
        ? formatFullName(updatedCertificate.activity.student.user)
        : 'un etudiant'
    } a ete approuvee.`,
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
    title: 'Validation rejetee',
    message: `La validation du certificat de ${
      updatedCertificate.activity?.student?.user
        ? formatFullName(updatedCertificate.activity.student.user)
        : 'un etudiant'
    } a ete rejetee.`,
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
    title: 'Validation approuvee',
    message: `La lettre de recommandation de ${
      updatedLetter.student?.user ? formatFullName(updatedLetter.student.user) : 'un etudiant'
    } a ete approuvee.`,
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
    title: 'Validation rejetee',
    message: `La lettre de recommandation de ${
      updatedLetter.student?.user ? formatFullName(updatedLetter.student.user) : 'un etudiant'
    } a ete rejetee.`,
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
    title: 'Validation approuvee',
    message: `Le commentaire de ${
      updatedComment.authorUser ? formatFullName(updatedComment.authorUser) : 'un utilisateur'
    } a ete approuve.`,
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
    title: 'Validation rejetee',
    message: `Le commentaire de ${
      updatedComment.authorUser ? formatFullName(updatedComment.authorUser) : 'un utilisateur'
    } a ete rejete.`,
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
    title: 'Validation approuvee',
    message: `La recommandation de ${
      updatedRecommendation.authorUser
        ? formatFullName(updatedRecommendation.authorUser)
        : 'un utilisateur'
    } a ete approuvee.`,
    relatedType: 'RECOMMENDATION_VALIDATION',
    relatedId: recommendationId,
  });

  return mapRecommendationValidationItem(updatedRecommendation);
};

const rejectRecommendationValidation = async (
  recommendationId,
  actorUserId,
  rejectionReason = null
) => {
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
    title: 'Validation rejetee',
    message: `La recommandation de ${
      updatedRecommendation.authorUser
        ? formatFullName(updatedRecommendation.authorUser)
        : 'un utilisateur'
    } a ete rejetee.`,
    relatedType: 'RECOMMENDATION_VALIDATION',
    relatedId: recommendationId,
  });

  return mapRecommendationValidationItem(updatedRecommendation);
};

const requestCertificateChanges = async (certificateId, administratorId, comment = null) => {
  const certificate = await getCertificateRequestOrThrow(certificateId);

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

  const updatedCertificate = await getCertificateRequestOrThrow(certificateId);
  await notificationService.createAdminActionNotification({
    title: 'Correction demandee',
    message: `Une correction a ete demandee pour le certificat de ${
      updatedCertificate.activity?.student?.user
        ? formatFullName(updatedCertificate.activity.student.user)
        : 'un etudiant'
    }.`,
    relatedType: 'CERTIFICATE_VALIDATION',
    relatedId: certificateId,
  });

  return mapCertificateRequestDetail(updatedCertificate);
};

const requestRecommendationLetterChanges = async (letterId, actorUserId, comment = null) => {
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
    title: 'Correction demandee',
    message: `Une correction a ete demandee pour la lettre de recommandation de ${
      updatedLetter.student?.user ? formatFullName(updatedLetter.student.user) : 'un etudiant'
    }.`,
    relatedType: 'RECOMMENDATION_LETTER_VALIDATION',
    relatedId: letterId,
  });

  return mapRecommendationLetterValidationItem(updatedLetter);
};

const requestCommentChanges = async (commentId, actorUserId, commentText = null) => {
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
    title: 'Correction demandee',
    message: `Une correction a ete demandee pour le commentaire de ${
      updatedComment.authorUser ? formatFullName(updatedComment.authorUser) : 'un utilisateur'
    }.`,
    relatedType: 'COMMENT_VALIDATION',
    relatedId: commentId,
  });

  return mapCommentValidationItem(updatedComment);
};

const requestRecommendationChanges = async (recommendationId, actorUserId, comment = null) => {
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
    title: 'Correction demandee',
    message: `Une correction a ete demandee pour la recommandation de ${
      updatedRecommendation.authorUser
        ? formatFullName(updatedRecommendation.authorUser)
        : 'un utilisateur'
    }.`,
    relatedType: 'RECOMMENDATION_VALIDATION',
    relatedId: recommendationId,
  });

  return mapRecommendationValidationItem(updatedRecommendation);
};

module.exports = {
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
};
