'use strict';

const prisma = require('../../config/prisma');
const { getStudentOrThrow } = require('./studentData');

const mapAcademicPaths = (academicPaths) =>
  academicPaths.map((item) => ({
    id: item.id,
    institution: item.institution,
    degree: item.degree,
    field: item.major,
    startDate: item.startDate,
    endDate: item.endDate,
    honor: item.honor,
  }));

const listAcademicPaths = async (userId) => {
  const student = await getStudentOrThrow(userId);
  return mapAcademicPaths(student.academicPaths);
};

const createAcademicPath = async (userId, payload) => {
  const student = await getStudentOrThrow(userId);

  await prisma.academicPath.create({
    data: {
      studentId: student.id,
      institution: payload.institution,
      degree: payload.degree,
      major: payload.field ?? payload.major ?? null,
      startDate: payload.startDate ? new Date(payload.startDate) : null,
      endDate: payload.endDate ? new Date(payload.endDate) : null,
      honor: payload.honor ?? null,
    },
  });

  return listAcademicPaths(userId);
};

const updateAcademicPath = async (userId, academicPathId, payload) => {
  const student = await getStudentOrThrow(userId);
  const existing = await prisma.academicPath.findFirst({
    where: {
      id: academicPathId,
      studentId: student.id,
    },
  });

  if (!existing) {
    throw new Error('ACADEMIC_PATH_NOT_FOUND');
  }

  await prisma.academicPath.update({
    where: { id: academicPathId },
    data: {
      institution: payload.institution ?? existing.institution,
      degree: payload.degree ?? existing.degree,
      major: payload.field ?? payload.major ?? existing.major,
      startDate: payload.startDate ? new Date(payload.startDate) : existing.startDate,
      endDate: payload.endDate ? new Date(payload.endDate) : existing.endDate,
      honor: payload.honor ?? existing.honor,
    },
  });

  return listAcademicPaths(userId);
};

const deleteAcademicPath = async (userId, academicPathId) => {
  const student = await getStudentOrThrow(userId);
  const existing = await prisma.academicPath.findFirst({
    where: {
      id: academicPathId,
      studentId: student.id,
    },
  });

  if (!existing) {
    throw new Error('ACADEMIC_PATH_NOT_FOUND');
  }

  await prisma.academicPath.delete({
    where: { id: academicPathId },
  });

  return {
    deleted: true,
    id: academicPathId,
  };
};

module.exports = {
  createAcademicPath,
  deleteAcademicPath,
  listAcademicPaths,
  updateAcademicPath,
};
