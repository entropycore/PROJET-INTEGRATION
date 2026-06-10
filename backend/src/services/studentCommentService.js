'use strict';

const prisma = require('../config/prisma');

const commentSelect = {
  id: true,
  targetType: true,
  targetId: true,
  content: true,
  status: true,
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
  portfolio: {
    select: {
      id: true,
      title: true,
      publicSlug: true,
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

const mapComment = (comment) => ({
  id: comment.id,
  targetType: comment.targetType || '',
  targetId: comment.targetId || '',
  content: comment.content,
  status: mapValidationStatus(comment.status),
  validationStatus: comment.status,
  createdAt: comment.createdAt,
  validatedAt: comment.validatedAt,
  rejectionReason: comment.rejectionReason || '',
  author: mapUser(comment.authorUser),
  validator: mapUser(comment.validatorUser),
  portfolio: comment.portfolio,
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

const countByStatus = (comments, status) =>
  comments.filter((comment) => comment.status === status).length;

exports.listStudentComments = async (userId, filters = {}) => {
  const studentId = await getStudentIdOrThrow(userId);
  const comments = await prisma.comment.findMany({
    where: {
      portfolio: {
        is: { studentId },
      },
    },
    orderBy: { createdAt: 'desc' },
    select: commentSelect,
  });

  const mappedComments = comments.map(mapComment);
  const requestedStatus = String(filters.status || '').trim().toUpperCase();
  const visibleComments =
    requestedStatus && requestedStatus !== 'ALL'
      ? mappedComments.filter((comment) => comment.status === requestedStatus)
      : mappedComments;

  return {
    stats: {
      received: countByStatus(mappedComments, 'RECEIVED'),
      pending: countByStatus(mappedComments, 'PENDING'),
      rejected: countByStatus(mappedComments, 'REJECTED'),
    },
    comments: visibleComments,
  };
};

exports.getStudentCommentById = async (userId, commentId) => {
  const studentId = await getStudentIdOrThrow(userId);
  const comment = await prisma.comment.findFirst({
    where: {
      id: commentId,
      portfolio: {
        is: { studentId },
      },
    },
    select: commentSelect,
  });

  if (!comment) {
    throw new Error('COMMENT_NOT_FOUND');
  }

  return mapComment(comment);
};
