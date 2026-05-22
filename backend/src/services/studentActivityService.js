'use strict';
const prisma = require('../config/prisma');

const getStudentOrThrow = async (userId) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!student) throw new Error('STUDENT_PROFILE_NOT_FOUND');
  return student;
};

exports.listActivities = async (userId) => {
  const student = await getStudentOrThrow(userId);

  const activities = await prisma.extracurricularActivity.findMany({
    where: { studentId: student.id },
    orderBy: [{ endDate: 'desc' }, { startDate: 'desc' }],
    select: {
      id: true,
      type: true,
      title: true,
      description: true,
      organization: true,
      startDate: true,
      endDate: true,
      visibility: true,
      certificates: {
        select: {
          id: true,
          documentUrl: true,
          validationStatus: true,
          submittedAt: true,
        },
      },
    },
  });

  return { activities };
};

exports.getActivityById = async (userId, activityId) => {
  const student = await getStudentOrThrow(userId);

  const activity = await prisma.extracurricularActivity.findFirst({
    where: { id: activityId, studentId: student.id },
    select: {
      id: true,
      type: true,
      title: true,
      description: true,
      organization: true,
      startDate: true,
      endDate: true,
      visibility: true,
      certificates: {
        select: {
          id: true,
          documentUrl: true,
          validationStatus: true,
          submittedAt: true,
        },
      },
    },
  });

  if (!activity) throw new Error('ACTIVITY_NOT_FOUND');
  return { activity };
};