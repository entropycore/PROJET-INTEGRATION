'use strict';

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const prisma = require('../config/prisma');
const notificationService = require('./notificationService');

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

const recommendationLetterValidationSelect = {
  id: true,
  validationStatus: true,
  createdAt: true,
  validatedAt: true,
  rejectionReason: true,
  title: true,
  content: true,
  type: true,
  documentUrl: true,
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
  authorUser: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      profilePicture: true,
    },
  },
  validatorUser: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
};

const commentValidationSelect = {
  id: true,
  status: true,
  createdAt: true,
  validatedAt: true,
  rejectionReason: true,
  targetType: true,
  targetId: true,
  content: true,
  authorUser: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      profilePicture: true,
    },
  },
  validatorUser: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
  portfolio: {
    select: {
      id: true,
      title: true,
      publicSlug: true,
      student: {
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
    },
  },
};

const recommendationValidationSelect = {
  id: true,
  status: true,
  createdAt: true,
  validatedAt: true,
  rejectionReason: true,
  title: true,
  content: true,
  organization: true,
  authorJobTitle: true,
  recommendationType: true,
  authorUser: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      profilePicture: true,
    },
  },
  validatorUser: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
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
        },
      },
    },
  },
  portfolio: {
    select: {
      id: true,
      title: true,
      publicSlug: true,
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
    label: "Demande d'acces",
    tone: user.accountStatus === 'PENDING' ? 'orange' : 'green',
    professional,
  };
};

const mapDashboardAccessRequest = (user) => {
  const professional = normalizeProfessionalData(user.professional);

  return {
    id: user.id,
    type: 'ACCESS_REQUEST',
    label: "Demande d'acces",
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

const mapDashboardCertificateRequest = (certificate) => {
  const requester = certificate.activity?.student?.user;

  return {
    id: certificate.id,
    type: 'CERTIFICATE_VALIDATION',
    label: 'Certificate validation',
    requesterName: requester ? formatFullName(requester) : 'Etudiant inconnu',
    email: requester?.email || null,
    organization: certificate.activity?.organization || null,
    createdAt: certificate.submittedAt,
    tone: 'green',
    status: certificate.validationStatus,
    raw: {
      certificateId: certificate.id,
      documentUrl: certificate.documentUrl,
      submittedAt: certificate.submittedAt,
      activityId: certificate.activity?.id || null,
      activityTitle: certificate.activity?.title || null,
      studentId: certificate.activity?.student?.id || null,
    },
  };
};

const mapCertificateRequestDetail = (certificate) => {
  const requester = certificate.activity?.student?.user;

  return {
    id: certificate.id,
    type: 'CERTIFICATE_VALIDATION',
    label: 'Certificate validation',
    requesterName: requester ? formatFullName(requester) : 'Etudiant inconnu',
    email: requester?.email || null,
    organization: certificate.activity?.organization || null,
    createdAt: certificate.submittedAt,
    tone: 'green',
    status: certificate.validationStatus,
    raw: {
      certificateId: certificate.id,
      documentUrl: certificate.documentUrl,
      submittedAt: certificate.submittedAt,
      activity: certificate.activity
        ? {
            id: certificate.activity.id,
            title: certificate.activity.title,
            description: certificate.activity.description || null,
            type: certificate.activity.type || null,
            organization: certificate.activity.organization || null,
            startDate: certificate.activity.startDate || null,
            endDate: certificate.activity.endDate || null,
          }
        : null,
      student: certificate.activity?.student
        ? {
            id: certificate.activity.student.id,
            apogeeCode: certificate.activity.student.apogeeCode || null,
            cne: certificate.activity.student.cne || null,
            major: certificate.activity.student.major,
            level: certificate.activity.student.level,
            city: certificate.activity.student.city || null,
            user: requester
              ? {
                  id: requester.id,
                  firstName: requester.firstName,
                  lastName: requester.lastName,
                  email: requester.email,
                  phone: requester.phone || null,
                  profilePicture: requester.profilePicture || null,
                }
              : null,
          }
        : null,
    },
  };
};

const mapRecommendationLetterValidationItem = (letter) => {
  const studentUser = letter.student?.user;
  const authorUser = letter.authorUser;

  return {
    id: letter.id,
    type: 'RECOMMENDATION_LETTER_VALIDATION',
    label: 'Recommendation letter validation',
    requesterName: studentUser ? formatFullName(studentUser) : 'Etudiant inconnu',
    email: studentUser?.email || null,
    organization: null,
    createdAt: letter.createdAt,
    tone: 'green',
    status: letter.validationStatus,
    raw: {
      title: letter.title,
      content: letter.content,
      letterType: letter.type,
      documentUrl: letter.documentUrl,
      validatedAt: letter.validatedAt,
      rejectionReason: letter.rejectionReason,
      authorName: authorUser ? formatFullName(authorUser) : null,
      authorUser,
      studentName: studentUser ? formatFullName(studentUser) : null,
      student: letter.student,
      validatorUser: letter.validatorUser,
    },
  };
};

const mapCommentValidationItem = (comment) => {
  const authorUser = comment.authorUser;
  const studentUser = comment.portfolio?.student?.user;

  return {
    id: comment.id,
    type: 'COMMENT_VALIDATION',
    label: 'Comment validation',
    requesterName: authorUser ? formatFullName(authorUser) : 'Auteur inconnu',
    email: authorUser?.email || null,
    organization: null,
    createdAt: comment.createdAt,
    tone: 'green',
    status: comment.status,
    raw: {
      title: comment.portfolio?.title || null,
      content: comment.content,
      targetType: comment.targetType,
      targetId: comment.targetId,
      validatedAt: comment.validatedAt,
      rejectionReason: comment.rejectionReason,
      authorName: authorUser ? formatFullName(authorUser) : null,
      authorUser,
      studentName: studentUser ? formatFullName(studentUser) : null,
      portfolioTitle: comment.portfolio?.title || null,
      portfolio: comment.portfolio,
      validatorUser: comment.validatorUser,
    },
  };
};

const mapRecommendationValidationItem = (recommendation) => {
  const authorUser = recommendation.authorUser;
  const studentUser = recommendation.student?.user;

  return {
    id: recommendation.id,
    type: 'RECOMMENDATION_VALIDATION',
    label: 'Recommendation validation',
    requesterName: authorUser ? formatFullName(authorUser) : 'Auteur inconnu',
    email: authorUser?.email || null,
    organization: recommendation.organization || null,
    createdAt: recommendation.createdAt,
    tone: 'green',
    status: recommendation.status,
    raw: {
      title: recommendation.title,
      content: recommendation.content,
      authorJobTitle: recommendation.authorJobTitle,
      recommendationType: recommendation.recommendationType,
      validatedAt: recommendation.validatedAt,
      rejectionReason: recommendation.rejectionReason,
      authorName: authorUser ? formatFullName(authorUser) : null,
      authorUser,
      studentName: studentUser ? formatFullName(studentUser) : null,
      student: recommendation.student,
      portfolioTitle: recommendation.portfolio?.title || null,
      portfolio: recommendation.portfolio,
      validatorUser: recommendation.validatorUser,
    },
  };
};

const mapReportItem = (report) => {
  const reporter = report.reporterUser;
  const reviewer = report.reviewedByAdministrator?.user || null;

  return {
    id: report.id,
    type: 'REPORT',
    label: 'Report',
    requesterName: reporter ? formatFullName(reporter) : 'Utilisateur inconnu',
    email: reporter?.email || null,
    organization: null,
    createdAt: report.createdAt,
    tone: 'red',
    status: report.status,
    raw: {
      targetType: report.targetType,
      targetId: report.targetId,
      reason: report.reason,
      description: report.description,
      reviewedAt: report.reviewedAt,
      resolutionNote: report.resolutionNote,
      reporterUser: reporter,
      reviewerName: reviewer ? formatFullName(reviewer) : null,
      reviewerUser: reviewer,
    },
  };
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
      })
    ),
    getPendingValidationCounts(),
    safeCount(() => prisma.report.count({ where: { status: 'PENDING' } })),
    getRecentDashboardRequests(),
  ]);

  return {
    summaryCards: {
      totalUsers: { value: totalUsers, variation: 'Comptes enregistres' },
      totalStudents: { value: totalStudents, variation: 'Profils etudiants' },
      totalProfessors: { value: totalProfessors, variation: 'Profils professeurs' },
      pendingRequests: { value: pendingRequests, variation: 'Demandes professionnelles' },
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
    title: "Demande d'acces approuvee",
    message: `La demande d'acces de ${updatedRequest.requesterName} a ete approuvee.`,
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
    title: "Demande d'acces rejetee",
    message: `La demande d'acces de ${updatedRequest.requesterName} a ete rejetee.`,
    relatedType: 'ACCESS_REQUEST',
    relatedId: userId,
  });

  return updatedRequest;
};

exports.listValidationItems = async ({ type, status = 'PENDING', page = 1, limit = 10, search } = {}) => {
  await syncPendingValidationNotifications();

  const normalizedType = type ? normalizeValidationType(type) : null;

  if (normalizedType) {
    ensureValidValidationType(normalizedType);
  }

  const loaders = [];

  if (!normalizedType || normalizedType === 'CERTIFICATE_VALIDATION') {
    loaders.push(loadCertificateValidationItems(status).then((items) => items.map(mapCertificateRequestDetail)));
  }

  if (!normalizedType || normalizedType === 'RECOMMENDATION_LETTER_VALIDATION') {
    loaders.push(
      loadRecommendationLetterValidationItems(status).then((items) =>
        items.map(mapRecommendationLetterValidationItem)
      )
    );
  }

  if (!normalizedType || normalizedType === 'COMMENT_VALIDATION') {
    loaders.push(loadCommentValidationItems(status).then((items) => items.map(mapCommentValidationItem)));
  }

  if (!normalizedType || normalizedType === 'RECOMMENDATION_VALIDATION') {
    loaders.push(
      loadRecommendationValidationItems(status).then((items) =>
        items.map(mapRecommendationValidationItem)
      )
    );
  }

  const mergedItems = (await Promise.all(loaders))
    .flat()
    .filter((item) => matchesValidationSearch(item, search))
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

  const paginated = paginateItems(mergedItems, page, limit);

  return {
    filters: {
      type: normalizedType,
      status,
      search: search || null,
    },
    ...paginated,
  };
};

exports.getValidationItemDetail = async (itemType, itemId) => {
  const normalizedType = normalizeValidationType(itemType);
  ensureValidValidationType(normalizedType);

  switch (normalizedType) {
    case 'CERTIFICATE_VALIDATION':
      return mapCertificateRequestDetail(await getValidationCertificateOrThrow(itemId));

    case 'RECOMMENDATION_LETTER_VALIDATION':
      return mapRecommendationLetterValidationItem(
        await getRecommendationLetterValidationOrThrow(itemId)
      );

    case 'COMMENT_VALIDATION':
      return mapCommentValidationItem(await getCommentValidationOrThrow(itemId));

    case 'RECOMMENDATION_VALIDATION':
      return mapRecommendationValidationItem(await getRecommendationValidationOrThrow(itemId));

    default:
      throw new Error('UNSUPPORTED_VALIDATION_TYPE');
  }
};

exports.approveValidationItem = async (
  itemType,
  itemId,
  actorUserId,
  administratorId,
  payload = {}
) => {
  const normalizedType = normalizeValidationType(itemType);
  ensureValidValidationType(normalizedType);

  switch (normalizedType) {
    case 'CERTIFICATE_VALIDATION':
      try {
        return await approveCertificateRequest(
          itemId,
          administratorId,
          typeof payload.comment === 'string' ? payload.comment.trim() || null : null
        );
      } catch (err) {
        if (err.message === 'DASHBOARD_ITEM_NOT_FOUND') {
          throw new Error('VALIDATION_ITEM_NOT_FOUND');
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

exports.rejectValidationItem = async (
  itemType,
  itemId,
  actorUserId,
  administratorId,
  payload = {}
) => {
  const normalizedType = normalizeValidationType(itemType);
  ensureValidValidationType(normalizedType);

  const normalizedReason =
    typeof payload.comment === 'string'
      ? payload.comment.trim() || null
      : typeof payload.rejectionReason === 'string'
        ? payload.rejectionReason.trim() || null
        : typeof payload.reason === 'string'
          ? payload.reason.trim() || null
          : null;

  switch (normalizedType) {
    case 'CERTIFICATE_VALIDATION':
      try {
        return await rejectCertificateRequest(itemId, administratorId, normalizedReason);
      } catch (err) {
        if (err.message === 'DASHBOARD_ITEM_NOT_FOUND') {
          throw new Error('VALIDATION_ITEM_NOT_FOUND');
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

exports.listNotifications = async ({
  administratorId,
  type,
  isRead,
  page = 1,
  limit = 10,
  search,
} = {}) => {
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
    ...(normalizedType ? { type: normalizedType } : {}),
    ...(typeof isRead === 'boolean' ? { isRead } : {}),
    ...(scopeConditions.length || normalizedSearch
      ? {
          AND: [
            ...scopeConditions,
            ...(normalizedSearch
              ? [
                  {
                    OR: [
                      { title: { contains: normalizedSearch, mode: 'insensitive' } },
                      { message: { contains: normalizedSearch, mode: 'insensitive' } },
                      { relatedType: { contains: normalizedSearch, mode: 'insensitive' } },
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
      })
    ),
    safeCount(() =>
      prisma.notification.count({
        where: scopeConditions.length
          ? {
              AND: scopeConditions,
            }
          : undefined,
      })
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
      []
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

exports.listReports = async ({ status = 'PENDING', targetType, page = 1, limit = 10, search } = {}) => {
  await syncPendingReportNotifications();

  const normalizedTargetType = targetType
    ? String(targetType).trim().toUpperCase().replace(/-/g, '_')
    : null;

  ensureValidReportStatus(status);

  if (normalizedTargetType) {
    ensureValidReportTargetType(normalizedTargetType);
  }

  const reports = await loadReportItems(status, normalizedTargetType);
  const filteredReports = reports
    .map(mapReportItem)
    .filter((item) => matchesValidationSearch(item, search));

  const paginated = paginateItems(filteredReports, page, limit);

  return {
    filters: {
      status,
      targetType: normalizedTargetType,
      search: search || null,
    },
    ...paginated,
  };
};

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
    message: `Le signalement lie a ${report.targetType.toLowerCase()} a ete approuve.`,
    relatedType: 'REPORT',
    relatedId: reportId,
  });

  return updatedReport;
};

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
    message: `Le signalement lie a ${report.targetType.toLowerCase()} a ete rejete.`,
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
      return approveCertificateRequest(
        itemId,
        administratorId,
        typeof payload.comment === 'string' ? payload.comment.trim() || null : null
      );

    case 'REPORT':
      return exports.approveReport(
        itemId,
        administratorId,
        typeof payload.resolutionNote === 'string'
          ? payload.resolutionNote.trim() || null
          : typeof payload.comment === 'string'
            ? payload.comment.trim() || null
            : null
      );

    default:
      throw new Error('UNSUPPORTED_DASHBOARD_ACTION_TYPE');
  }
};

exports.rejectDashboardItem = async (itemType, itemId, administratorId, payload = {}) => {
  const normalizedType = String(itemType || '')
    .trim()
    .toUpperCase()
    .replace(/-/g, '_');

  const normalizedComment =
    typeof payload.comment === 'string'
      ? payload.comment.trim() || null
      : typeof payload.rejectionReason === 'string'
        ? payload.rejectionReason.trim() || null
        : typeof payload.reason === 'string'
          ? payload.reason.trim() || null
          : null;

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
