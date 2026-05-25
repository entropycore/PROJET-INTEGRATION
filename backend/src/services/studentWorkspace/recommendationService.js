'use strict';

const {
  bcrypt,
  crypto,
  prisma,
  VALID_VISIBILITIES,
  VALID_RECOMMENDATION_STATUSES,
  VALID_PROJECT_TYPES,
  VALID_ACTIVITY_TYPES,
  serviceError,
  toEnum,
  toDate,
  normalizePreferences,
  requireBoolean,
  fromRecommendationUiStatus,
  getStudentOrThrow,
  ensureProjectOwner,
  ensureInternshipOwner,
  ensureActivityOwner,
  projectInclude,
  internshipInclude,
  activityInclude,
  fullName,
  recommendationInclude,
  mapStudentRecommendation,
  mapProject,
  mapInternship,
  mapInternshipMedia,
  mapActivity,
  syncTechnologies,
} = require('./shared');

exports.listRecommendations = async (userId, params = {}) => {
  const student = await getStudentOrThrow(userId);
  const status = fromRecommendationUiStatus(params.status);

  if (status && !VALID_RECOMMENDATION_STATUSES.has(status)) {
    throw serviceError('INVALID_RECOMMENDATION_STATUS', 400);
  }

  const where = {
    studentId: student.id,
    ...(status ? { status } : {}),
  };

  const [received, pending, rejected, recommendations] = await Promise.all([
    prisma.recommendation.count({ where: { studentId: student.id, status: 'APPROVED' } }),
    prisma.recommendation.count({ where: { studentId: student.id, status: 'PENDING' } }),
    prisma.recommendation.count({ where: { studentId: student.id, status: 'REJECTED' } }),
    prisma.recommendation.findMany({
      where,
      include: recommendationInclude,
      orderBy: [{ createdAt: 'desc' }],
    }),
  ]);

  const mappedRecommendations = recommendations.map(mapStudentRecommendation);

  return {
    stats: { received, pending, rejected },
    recommendations: mappedRecommendations,
    items: mappedRecommendations,
    filters: {
      status: params.status || 'ALL',
    },
  };
};

exports.getRecommendation = async (userId, recommendationId) => {
  const student = await getStudentOrThrow(userId);
  const recommendation = await prisma.recommendation.findFirst({
    where: { id: recommendationId, studentId: student.id },
    include: recommendationInclude,
  });

  if (!recommendation) throw serviceError('RECOMMENDATION_NOT_FOUND', 404);
  return mapStudentRecommendation(recommendation);
};

exports.updateRecommendationVisibility = async (userId, recommendationId, visibility) => {
  const student = await getStudentOrThrow(userId);
  const normalizedVisibility = toEnum(visibility, null, VALID_VISIBILITIES);

  if (!normalizedVisibility) throw serviceError('INVALID_VISIBILITY', 400);

  const existing = await prisma.recommendation.findFirst({
    where: { id: recommendationId, studentId: student.id },
    select: { id: true },
  });

  if (!existing) throw serviceError('RECOMMENDATION_NOT_FOUND', 404);

  const recommendation = await prisma.recommendation.update({
    where: { id: recommendationId },
    data: { visibility: normalizedVisibility },
    include: recommendationInclude,
  });

  return mapStudentRecommendation(recommendation);
};

exports.updateRecommendationStatus = async (userId, recommendationId, status) => {
  const student = await getStudentOrThrow(userId);
  const normalizedStatus = fromRecommendationUiStatus(status);

  if (!normalizedStatus || !VALID_RECOMMENDATION_STATUSES.has(normalizedStatus)) {
    throw serviceError('INVALID_RECOMMENDATION_STATUS', 400);
  }

  const existing = await prisma.recommendation.findFirst({
    where: { id: recommendationId, studentId: student.id },
    select: { id: true },
  });

  if (!existing) throw serviceError('RECOMMENDATION_NOT_FOUND', 404);

  const recommendation = await prisma.recommendation.update({
    where: { id: recommendationId },
    data: {
      status: normalizedStatus,
      validatedAt: ['APPROVED', 'REJECTED'].includes(normalizedStatus) ? new Date() : null,
      rejectionReason: normalizedStatus === 'REJECTED' ? 'Refuse par l etudiant.' : null,
    },
    include: recommendationInclude,
  });

  return mapStudentRecommendation(recommendation);
};
