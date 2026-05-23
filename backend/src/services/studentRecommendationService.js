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
