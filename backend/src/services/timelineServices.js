'use strict';

const prisma = require('../config/prisma');


const getStudentIdOrThrow = async (userId) => {
  const student = await prisma.student.findUnique({
    where: { userId: userId },
    select: { id: true }
  });

  if (!student) {
    const error = new Error('STUDENT_PROFILE_NOT_FOUND');
    error.statusCode = 404;
    throw error;
  }
  return student.id;
};


const getTimelineByStudentId = async (userId) => {
  const studentId = await getStudentIdOrThrow(userId);
  
  return await prisma.academicTimelineEntry.findMany({
    where: { studentId },
    orderBy: { startDate: 'desc' }, 
  });
};

const createEntry = async (userId, bodyData) => {
  const studentId = await getStudentIdOrThrow(userId);

  return await prisma.academicTimelineEntry.create({
    data: {
      title: bodyData.title,
      institution: bodyData.institution,
      startDate: new Date(bodyData.startDate),
      endDate: bodyData.endDate ? new Date(bodyData.endDate) : null,
      description: bodyData.description || null,
      studentId: studentId 
    },
  });
};


const updateEntry = async (entryId, userId, newData) => {
  const studentId = await getStudentIdOrThrow(userId);

  const entry = await prisma.academicTimelineEntry.findUnique({
    where: { id: entryId },
  });

  if (!entry) {
    const error = new Error('Étape introuvable');
    error.statusCode = 404;
    throw error;
  }

 
  if (entry.studentId !== studentId) {
    const error = new Error('Action interdite : vous n’êtes pas le propriétaire de cette étape');
    error.statusCode = 403;
    throw error;
  }

  return await prisma.academicTimelineEntry.update({
    where: { id: entryId },
    data: {
      title: newData.title ?? entry.title,
      institution: newData.institution ?? entry.institution,
      startDate: newData.startDate ? new Date(newData.startDate) : entry.startDate,
      endDate: newData.endDate ? new Date(newData.endDate) : entry.endDate,
      description: newData.description ?? entry.description,
    },
  });
};


const deleteEntry = async (entryId, userId) => {
  const studentId = await getStudentIdOrThrow(userId);

  const entry = await prisma.academicTimelineEntry.findUnique({
    where: { id: entryId },
  });

  if (!entry) {
    const error = new Error('Étape introuvable');
    error.statusCode = 404;
    throw error;
  }

  
  if (entry.studentId !== studentId) {
    const error = new Error('Action interdite');
    error.statusCode = 403;
    throw error;
  }

  return await prisma.academicTimelineEntry.delete({
    where: { id: entryId },
  });
};

module.exports = {
  getTimelineByStudentId,
  createEntry,
  updateEntry,
  deleteEntry,
};