'use strict';

const prisma = require('../../config/prisma');
const { studentDashboardSelect, studentProfileSelect } = require('./profileSelects');

const getStudentOrThrow = async (userId) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: studentProfileSelect,
  });

  if (!student) {
    throw new Error('STUDENT_PROFILE_NOT_FOUND');
  }

  return student;
};

const getStudentDashboardBaseOrThrow = async (userId) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: studentDashboardSelect,
  });

  if (!student) {
    throw new Error('STUDENT_PROFILE_NOT_FOUND');
  }

  return student;
};

module.exports = {
  getStudentDashboardBaseOrThrow,
  getStudentOrThrow,
};
