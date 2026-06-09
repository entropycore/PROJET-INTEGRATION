'use strict';

const prisma = require('../../config/prisma');
const { formatFullName } = require('./dashboardHelpers');

const listStudentComments = async (userId) => {
  const comments = await prisma.comment.findMany({
    where: {
      portfolio: {
        student: {
          userId,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      content: true,
      status: true,
      targetType: true,
      createdAt: true,
      validatedAt: true,
      rejectionReason: true,
      authorUser: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return comments.map((comment) => ({
    id: comment.id,
    content: comment.content,
    status: comment.status,
    targetType: comment.targetType,
    createdAt: comment.createdAt,
    validatedAt: comment.validatedAt,
    rejectionReason: comment.rejectionReason,
    author: {
      fullName: formatFullName(comment.authorUser),
      email: comment.authorUser.email,
    },
  }));
};

module.exports = {
  listStudentComments,
};
