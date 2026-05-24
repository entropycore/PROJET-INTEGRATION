'use strict';

const prisma = require('../config/prisma');

const recommendationSelect = {
  id: true,
  content: true,
  status: true,
  visibility: true,
  createdAt: true,
  organization: true,
  authorJobTitle: true,
  authorUser: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      role: true,
      profilePicture: true,
    },
  },
};

const ALLOWED_VISIBILITY = new Set(['PUBLIC', 'PRIVATE', 'TEACHERS', 'SHARED_LINK']);

const roleLabels = {
  STUDENT: 'Étudiant',
  PROFESSOR: 'Enseignant',
  PROFESSIONAL: 'Professionnel',
  ADMINISTRATOR: 'Administrateur',
};

const formatFullName = (user) => `${user.firstName} ${user.lastName}`.trim();

const buildInitials = (user) =>
  [user.firstName, user.lastName]
    .map((name) => String(name || '').trim().charAt(0))
    .filter(Boolean)
    .join('')
    .toUpperCase();

const mapRecommendationStatus = (status) => {
  if (status === 'APPROVED') return 'RECEIVED';
  if (status === 'REJECTED' || status === 'CHANGES_REQUESTED') return 'REJECTED';
  return 'PENDING';
};

const mapRecommendation = (recommendation) => ({
  id: recommendation.id,
  author: {
    id: recommendation.authorUser.id,
    name: formatFullName(recommendation.authorUser),
    role: recommendation.authorJobTitle || roleLabels[recommendation.authorUser.role] || '',
    organization: recommendation.organization || '',
    profilePicture: recommendation.authorUser.profilePicture || '',
    initials: buildInitials(recommendation.authorUser),
  },
  content: recommendation.content,
  status: mapRecommendationStatus(recommendation.status),
  visibility: recommendation.visibility,
  read: true,
  createdAt: recommendation.createdAt,
});

const getStudentIdOrThrow = async (userId) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!student) {
    throw new Error('STUDENT_PROFILE_NOT_FOUND');
  }

  return student.id;
};

const getStudentRecommendationOrThrow = async (userId, recommendationId) => {
  const studentId = await getStudentIdOrThrow(userId);
  const recommendation = await prisma.recommendation.findFirst({
    where: {
      id: recommendationId,
      studentId,
    },
    select: recommendationSelect,
  });

  if (!recommendation) {
    throw new Error('RECOMMENDATION_NOT_FOUND');
  }

  return recommendation;
};

const countByStatus = (recommendations, status) =>
  recommendations.filter((recommendation) => recommendation.status === status).length;

exports.listStudentRecommendations = async (userId, filters = {}) => {
  const studentId = await getStudentIdOrThrow(userId);
  const recommendations = await prisma.recommendation.findMany({
    where: { studentId },
    orderBy: { createdAt: 'desc' },
    select: recommendationSelect,
  });
  const mappedRecommendations = recommendations.map(mapRecommendation);
  const requestedStatus = String(filters.status || '').trim().toUpperCase();
  const visibleRecommendations =
    requestedStatus && requestedStatus !== 'ALL'
      ? mappedRecommendations.filter((recommendation) => recommendation.status === requestedStatus)
      : mappedRecommendations;

  return {
    stats: {
      received: countByStatus(mappedRecommendations, 'RECEIVED'),
      pending: countByStatus(mappedRecommendations, 'PENDING'),
      rejected: countByStatus(mappedRecommendations, 'REJECTED'),
    },
    recommendations: visibleRecommendations,
  };
};

exports.getStudentRecommendationById = async (userId, recommendationId) =>
  mapRecommendation(await getStudentRecommendationOrThrow(userId, recommendationId));

exports.updateStudentRecommendationVisibility = async (userId, recommendationId, visibility) => {
  await getStudentRecommendationOrThrow(userId, recommendationId);
  const normalizedVisibility = String(visibility || '').trim().toUpperCase();

  if (!ALLOWED_VISIBILITY.has(normalizedVisibility)) {
    throw new Error('INVALID_RECOMMENDATION_VISIBILITY');
  }

  const updated = await prisma.recommendation.update({
    where: { id: recommendationId },
    data: { visibility: normalizedVisibility },
    select: recommendationSelect,
  });

  return mapRecommendation(updated);
};

exports.updateStudentRecommendationStatus = async (userId, recommendationId, status) => {
  await getStudentRecommendationOrThrow(userId, recommendationId);
  const normalizedStatus = String(status || '').trim().toUpperCase();
  const statusMap = {
    RECEIVED: 'APPROVED',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    PENDING: 'PENDING',
  };
  const nextStatus = statusMap[normalizedStatus];

  if (!nextStatus) {
    throw new Error('INVALID_RECOMMENDATION_STATUS');
  }

  const updated = await prisma.recommendation.update({
    where: { id: recommendationId },
    data: {
      status: nextStatus,
      visibility: nextStatus === 'APPROVED' ? 'PUBLIC' : 'PRIVATE',
      validatedAt: nextStatus === 'APPROVED' ? new Date() : null,
    },
    select: recommendationSelect,
  });

  return mapRecommendation(updated);
};
