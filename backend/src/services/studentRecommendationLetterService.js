'use strict';

const prisma = require('../config/prisma');

const ALLOWED_VISIBILITY = new Set(['PUBLIC', 'PRIVATE', 'TEACHERS', 'SHARED_LINK']);

const letterSelect = {
  id: true,
  title: true,
  content: true,
  type: true,
  documentUrl: true,
  validationStatus: true,
  visibility: true,
  downloadable: true,
  createdAt: true,
  validatedAt: true,
  rejectionReason: true,
  authorUser: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      role: true,
      profilePicture: true,
    },
  },
  validatorUser: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  },
};

const roleLabels = {
  STUDENT: 'Student',
  PROFESSOR: 'Professor',
  PROFESSIONAL: 'Professional',
  ADMINISTRATOR: 'Administrator',
};

const formatFullName = (user) => `${user.firstName} ${user.lastName}`.trim();

const buildInitials = (user) =>
  [user.firstName, user.lastName]
    .map((name) => String(name || '').trim().charAt(0))
    .filter(Boolean)
    .join('')
    .toUpperCase();

const mapValidationStatus = (status) => {
  if (status === 'APPROVED') return 'RECEIVED';
  if (status === 'REJECTED' || status === 'CHANGES_REQUESTED') return 'REJECTED';
  return 'PENDING';
};

const mapUser = (user) => {
  if (!user) return null;

  return {
    id: user.id,
    name: formatFullName(user),
    role: roleLabels[user.role] || user.role || '',
    profilePicture: user.profilePicture || '',
    initials: buildInitials(user),
  };
};

const mapLetter = (letter) => ({
  id: letter.id,
  title: letter.title,
  content: letter.content,
  type: letter.type,
  documentUrl: letter.documentUrl || '',
  downloadUrl: letter.documentUrl || '',
  status: mapValidationStatus(letter.validationStatus),
  validationStatus: letter.validationStatus,
  visibility: letter.visibility,
  downloadable: letter.downloadable,
  createdAt: letter.createdAt,
  validatedAt: letter.validatedAt,
  rejectionReason: letter.rejectionReason || '',
  author: mapUser(letter.authorUser),
  validator: mapUser(letter.validatorUser),
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

const getStudentLetterOrThrow = async (userId, letterId) => {
  const studentId = await getStudentIdOrThrow(userId);
  const letter = await prisma.recommendationLetter.findFirst({
    where: {
      id: letterId,
      studentId,
    },
    select: letterSelect,
  });

  if (!letter) {
    throw new Error('RECOMMENDATION_LETTER_NOT_FOUND');
  }

  return letter;
};

const countByStatus = (letters, status) =>
  letters.filter((letter) => letter.status === status).length;

exports.listStudentRecommendationLetters = async (userId, filters = {}) => {
  const studentId = await getStudentIdOrThrow(userId);
  const letters = await prisma.recommendationLetter.findMany({
    where: { studentId },
    orderBy: { createdAt: 'desc' },
    select: letterSelect,
  });

  const mappedLetters = letters.map(mapLetter);
  const requestedStatus = String(filters.status || '').trim().toUpperCase();
  const visibleLetters =
    requestedStatus && requestedStatus !== 'ALL'
      ? mappedLetters.filter((letter) => letter.status === requestedStatus)
      : mappedLetters;

  return {
    stats: {
      received: countByStatus(mappedLetters, 'RECEIVED'),
      pending: countByStatus(mappedLetters, 'PENDING'),
      rejected: countByStatus(mappedLetters, 'REJECTED'),
    },
    recommendationLetters: visibleLetters,
  };
};

exports.getStudentRecommendationLetterById = async (userId, letterId) =>
  mapLetter(await getStudentLetterOrThrow(userId, letterId));

exports.updateStudentRecommendationLetterVisibility = async (
  userId,
  letterId,
  visibility,
) => {
  await getStudentLetterOrThrow(userId, letterId);
  const normalizedVisibility = String(visibility || '').trim().toUpperCase();

  if (!ALLOWED_VISIBILITY.has(normalizedVisibility)) {
    throw new Error('INVALID_RECOMMENDATION_LETTER_VISIBILITY');
  }

  const updated = await prisma.recommendationLetter.update({
    where: { id: letterId },
    data: { visibility: normalizedVisibility },
    select: letterSelect,
  });

  return mapLetter(updated);
};

exports.updateStudentRecommendationLetterDownloadable = async (
  userId,
  letterId,
  downloadable,
) => {
  await getStudentLetterOrThrow(userId, letterId);

  if (typeof downloadable !== 'boolean') {
    throw new Error('INVALID_RECOMMENDATION_LETTER_DOWNLOADABLE');
  }

  const updated = await prisma.recommendationLetter.update({
    where: { id: letterId },
    data: { downloadable },
    select: letterSelect,
  });

  return mapLetter(updated);
};
