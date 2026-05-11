const prisma = require('../config/prisma');


const getTimelineByStudentId = async (studentId) => {
  return await prisma.academicTimelineEntry.findMany({
    where: { studentId },
    orderBy: { startDate: 'desc' }, // tri décroissant
  });
};

const createEntry = async (data) => {
  return await prisma.academicTimelineEntry.create({
    data,
  });
};

const updateEntry = async (entryId, studentId, newData) => {
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
    data: newData,
  });
};

const deleteEntry = async (entryId, studentId) => {
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