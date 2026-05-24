'use strict';

const prisma = require('../../config/prisma');
const { recentCertificateSelect } = require('./serviceSelects');
const {
  certificateDetailSelect,
  commentValidationSelect,
  internshipValidationSelect,
  projectValidationSelect,
  recommendationLetterValidationSelect,
  recommendationValidationSelect,
} = require('./validationSelects');
const { safeCount, safeReadWithFallback } = require('./serviceUtils');

const VALIDATION_ITEM_TYPES = [
  'PROJECT',
  'INTERNSHIP',
  'CERTIFICATE_VALIDATION',
  'RECOMMENDATION_LETTER_VALIDATION',
  'COMMENT_VALIDATION',
  'RECOMMENDATION_VALIDATION',
];
const LEGACY_VALIDATION_TYPES = ['PROJECT', 'INTERNSHIP', 'CERTIFICATE', 'ACTIVITY'];

const normalizeValidationType = (value) =>
  typeof value === 'string' ? value.trim().toUpperCase().replace(/-/g, '_') : value;

const normalizeLegacyValidationType = (value) =>
  typeof value === 'string' ? value.trim().toUpperCase().replace(/-/g, '_') : value;

const ensureValidValidationType = (type) => {
  if (!VALIDATION_ITEM_TYPES.includes(type)) {
    throw new Error('UNSUPPORTED_VALIDATION_TYPE');
  }
};

const ensureValidLegacyValidationType = (type) => {
  if (!LEGACY_VALIDATION_TYPES.includes(type)) {
    throw new Error('UNSUPPORTED_LEGACY_VALIDATION_TYPE');
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
    safeReadWithFallback(() => prisma.project.findUnique({ where: { id: itemId }, select: { id: true } }), null, null),
    safeReadWithFallback(
      () => prisma.internship.findUnique({ where: { id: itemId }, select: { id: true } }),
      null,
      null,
    ),
    safeReadWithFallback(
      () => prisma.certificate.findUnique({ where: { id: itemId }, select: { id: true } }),
      null,
      null,
    ),
    safeReadWithFallback(
      () => prisma.recommendationLetter.findUnique({ where: { id: itemId }, select: { id: true } }),
      null,
      null,
    ),
    safeReadWithFallback(() => prisma.comment.findUnique({ where: { id: itemId }, select: { id: true } }), null, null),
    safeReadWithFallback(
      () => prisma.recommendation.findUnique({ where: { id: itemId }, select: { id: true } }),
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
    safeCount(() => prisma.recommendationLetter.count({ where: { validationStatus: 'PENDING' } })),
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

const getRecentCertificateRequests = async () =>
  safeReadWithFallback(
    () =>
      prisma.certificate.findMany({
        where: { validationStatus: 'PENDING' },
        orderBy: [{ submittedAt: 'desc' }],
        take: 5,
        select: recentCertificateSelect,
      }),
    null,
    [],
  );

module.exports = {
  ensureValidLegacyValidationType,
  ensureValidValidationType,
  getCertificateRequestOrThrow,
  getCommentValidationOrThrow,
  getInternshipValidationOrThrow,
  getPendingValidationCounts,
  getProjectValidationOrThrow,
  getRecentCertificateRequests,
  getRecommendationLetterValidationOrThrow,
  getRecommendationValidationOrThrow,
  getValidationCertificateOrThrow,
  loadCertificateValidationItems,
  loadCommentValidationItems,
  loadInternshipValidationItems,
  loadProjectValidationItems,
  loadRecommendationLetterValidationItems,
  loadRecommendationValidationItems,
  mapLegacyPendingValidationCounts,
  normalizeLegacyValidationType,
  normalizeValidationType,
  resolveValidationItemTypeById,
};
