'use strict';

const prisma = require('../../config/prisma');
const { getProfessorByUserId } = require('./data');
const {
  normalizeSearch,
  normalizeValidationStatus,
  normalizeValidationType,
  readComment,
  sortByDateDesc,
} = require('./helpers');
const {
  mapInternshipValidationItem,
  mapProjectValidationItem,
} = require('./mappers');
const {
  professorInternshipValidationSelect,
  professorProjectValidationSelect,
} = require('./selects');

const validationSearchMatches = (item, search) => {
  const value = normalizeSearch(search);
  if (!value) return true;

  const values = [
    item.title,
    item.description,
    item.student?.fullName,
    item.student?.email,
    item.student?.field,
    item.targetDetails?.company,
    item.targetDetails?.projectType,
  ]
    .filter(Boolean)
    .map((entry) => String(entry).toLowerCase());

  return values.some((entry) => entry.includes(value));
};

const buildProjectWhere = (professorId, status) => ({
  validatorProfessorId: professorId,
  ...(status ? { validationStatus: status } : {}),
});

const buildInternshipWhere = (professorId, status) => ({
  supervisorProfessorId: professorId,
  ...(status ? { validationStatus: status } : {}),
});

const loadProjectValidations = (professorId, status) =>
  prisma.project.findMany({
    where: buildProjectWhere(professorId, status),
    orderBy: [{ submittedAt: 'desc' }, { createdAt: 'desc' }],
    take: 100,
    select: professorProjectValidationSelect,
  });

const loadInternshipValidations = (professorId, status) =>
  prisma.internship.findMany({
    where: buildInternshipWhere(professorId, status),
    orderBy: [{ startDate: 'desc' }, { endDate: 'desc' }],
    take: 100,
    select: professorInternshipValidationSelect,
  });

const listProfessorValidations = async (userId, filters = {}) => {
  const professor = await getProfessorByUserId(userId);
  const type = normalizeValidationType(filters.type);
  const status = normalizeValidationStatus(filters.status || 'PENDING');

  const loaders = [];

  if (!type || type === 'PROJECT') {
    loaders.push(
      loadProjectValidations(professor.id, status).then((items) =>
        items.map(mapProjectValidationItem),
      ),
    );
  }

  if (!type || type === 'INTERNSHIP') {
    loaders.push(
      loadInternshipValidations(professor.id, status).then((items) =>
        items.map(mapInternshipValidationItem),
      ),
    );
  }

  const items = sortByDateDesc((await Promise.all(loaders)).flat()).filter(
    (item) => validationSearchMatches(item, filters.search),
  );

  return {
    filters: {
      type,
      status,
      search: filters.search || null,
    },
    count: items.length,
    items,
  };
};

const getProfessorValidationStats = async (userId) => {
  const professor = await getProfessorByUserId(userId);

  const [projects, internships, approved, rejected, changesRequested] =
    await Promise.all([
      prisma.project.count({
        where: buildProjectWhere(professor.id, 'PENDING'),
      }),
      prisma.internship.count({
        where: buildInternshipWhere(professor.id, 'PENDING'),
      }),
      Promise.all([
        prisma.project.count({
          where: buildProjectWhere(professor.id, 'APPROVED'),
        }),
        prisma.internship.count({
          where: buildInternshipWhere(professor.id, 'APPROVED'),
        }),
      ]),
      Promise.all([
        prisma.project.count({
          where: buildProjectWhere(professor.id, 'REJECTED'),
        }),
        prisma.internship.count({
          where: buildInternshipWhere(professor.id, 'REJECTED'),
        }),
      ]),
      Promise.all([
        prisma.project.count({
          where: buildProjectWhere(professor.id, 'CHANGES_REQUESTED'),
        }),
        prisma.internship.count({
          where: buildInternshipWhere(professor.id, 'CHANGES_REQUESTED'),
        }),
      ]),
    ]);

  const approvedCount = approved[0] + approved[1];
  const rejectedCount = rejected[0] + rejected[1];
  const changesRequestedCount = changesRequested[0] + changesRequested[1];

  return {
    count: projects + internships,
    projects,
    internships,
    approved: approvedCount,
    rejected: rejectedCount,
    changesRequested: changesRequestedCount,
  };
};

const getProjectForProfessorOrThrow = async (professorId, projectId) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      validatorProfessorId: professorId,
    },
    select: professorProjectValidationSelect,
  });

  if (!project) {
    throw new Error('PROFESSOR_VALIDATION_NOT_FOUND');
  }

  return project;
};

const getInternshipForProfessorOrThrow = async (professorId, internshipId) => {
  const internship = await prisma.internship.findFirst({
    where: {
      id: internshipId,
      supervisorProfessorId: professorId,
    },
    select: professorInternshipValidationSelect,
  });

  if (!internship) {
    throw new Error('PROFESSOR_VALIDATION_NOT_FOUND');
  }

  return internship;
};

const getProfessorValidationDetail = async (userId, itemType, itemId) => {
  const professor = await getProfessorByUserId(userId);
  const type = normalizeValidationType(itemType);

  if (type === 'PROJECT') {
    return mapProjectValidationItem(
      await getProjectForProfessorOrThrow(professor.id, itemId),
    );
  }

  return mapInternshipValidationItem(
    await getInternshipForProfessorOrThrow(professor.id, itemId),
  );
};

const ensurePendingValidation = (item) => {
  if (item.validationStatus !== 'PENDING') {
    throw new Error('PROFESSOR_VALIDATION_INVALID_STATE');
  }
};

const updateProjectDecision = async (
  professorId,
  projectId,
  decision,
  payload = {},
) => {
  const project = await getProjectForProfessorOrThrow(professorId, projectId);
  ensurePendingValidation(project);

  const comment = readComment(payload);

  await prisma.$transaction(async (tx) => {
    await tx.project.update({
      where: { id: project.id },
      data: {
        validationStatus: decision,
        generalFeedback: comment || project.generalFeedback,
      },
    });

    await tx.projectValidation.create({
      data: {
        projectId: project.id,
        professorId,
        decision,
        comment,
        professorFeedback: comment,
      },
    });
  });

  return getProfessorValidationDetailByProfessorId(
    professorId,
    'PROJECT',
    projectId,
  );
};

const updateInternshipDecision = async (
  professorId,
  internshipId,
  decision,
  payload = {},
) => {
  const internship = await getInternshipForProfessorOrThrow(
    professorId,
    internshipId,
  );
  ensurePendingValidation(internship);

  const comment = readComment(payload);

  await prisma.$transaction(async (tx) => {
    await tx.internship.update({
      where: { id: internship.id },
      data: { validationStatus: decision },
    });

    await tx.internshipValidation.create({
      data: {
        internshipId: internship.id,
        professorId,
        decision,
        comment,
      },
    });
  });

  return getProfessorValidationDetailByProfessorId(
    professorId,
    'INTERNSHIP',
    internshipId,
  );
};

const getProfessorValidationDetailByProfessorId = async (
  professorId,
  itemType,
  itemId,
) => {
  const type = normalizeValidationType(itemType);

  if (type === 'PROJECT') {
    return mapProjectValidationItem(
      await getProjectForProfessorOrThrow(professorId, itemId),
    );
  }

  return mapInternshipValidationItem(
    await getInternshipForProfessorOrThrow(professorId, itemId),
  );
};

const updateDecision = async (
  userId,
  itemType,
  itemId,
  decision,
  payload = {},
) => {
  const professor = await getProfessorByUserId(userId);
  const type = normalizeValidationType(itemType);

  if (type === 'PROJECT') {
    return updateProjectDecision(professor.id, itemId, decision, payload);
  }

  return updateInternshipDecision(professor.id, itemId, decision, payload);
};

const approveProfessorValidation = (userId, itemType, itemId, payload = {}) =>
  updateDecision(userId, itemType, itemId, 'APPROVED', payload);

const rejectProfessorValidation = (userId, itemType, itemId, payload = {}) =>
  updateDecision(userId, itemType, itemId, 'REJECTED', payload);

const requestProfessorValidationChanges = (
  userId,
  itemType,
  itemId,
  payload = {},
) => updateDecision(userId, itemType, itemId, 'CHANGES_REQUESTED', payload);

module.exports = {
  approveProfessorValidation,
  getProfessorValidationDetail,
  getProfessorValidationStats,
  listProfessorValidations,
  rejectProfessorValidation,
  requestProfessorValidationChanges,
};
