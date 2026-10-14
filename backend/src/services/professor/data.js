'use strict';

const prisma = require('../../config/prisma');
const { professorBaseSelect } = require('./selects');

const getProfessorByUserId = async (userId, select = professorBaseSelect) => {
  const normalizedUserId = userId == null ? '' : String(userId);

  const professor = await prisma.professor.findUnique({
    where: { userId: normalizedUserId },
    select,
  });

  if (!professor) {
    throw new Error('PROFESSOR_PROFILE_NOT_FOUND');
  }

  return professor;
};

module.exports = {
  getProfessorByUserId,
};
