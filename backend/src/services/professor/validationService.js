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
  mapStudentSummary,
  mapProjectValidationItem,
} = require('./mappers');
const {
  professorInternshipValidationSelect,
  professorProjectValidationSelect,
} = require('./selects');
const { getProjectFileTarget } = require('../student/projectMediaStorage');
const { getStageFileTarget } = require('../student/stageMediaStorage');

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

const historySearchMatches = (item, search) => {
  const value = normalizeSearch(search);
  if (!value) return true;

  const values = [
    item.title,
    item.description,
    item.student?.fullName,
    item.student?.email,
    item.comment,
    item.actionLabel,
  ]
    .filter(Boolean)
    .map((entry) => String(entry).toLowerCase());

  return values.some((entry) => entry.includes(value));
};

const historyStudentSelect = {
  id: true,
  apogeeCode: true,
  cne: true,
  major: true,
  level: true,
  city: true,
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      profilePicture: true,
    },
  },
};

const decisionLabels = {
  APPROVED: 'Validation approuvee',
  REJECTED: 'Validation refusee',
  CHANGES_REQUESTED: 'Correction demandee',
};

const getDecisionLabel = (decision) => decisionLabels[decision] || decision;

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

const getProjectValidationFile = async (professorId, projectId, fileId, action) => {
  await getProjectForProfessorOrThrow(professorId, projectId);

  const media = await prisma.projectMedia.findFirst({
    where: {
      id: fileId,
      projectId,
    },
    select: {
      id: true,
      mediaType: true,
      description: true,
      fileName: true,
      mimeType: true,
      storagePath: true,
    },
  });

  if (!media?.storagePath) {
    throw new Error('PROFESSOR_VALIDATION_FILE_NOT_FOUND');
  }

  const inlineTypes = new Set(['IMAGE', 'SCREENSHOT']);
  const contentDisposition =
    action === 'content' && inlineTypes.has(media.mediaType) ? 'inline' : 'attachment';

  return {
    target: await getProjectFileTarget(media.storagePath, {
      originalName: media.fileName || media.description || 'fichier-projet',
      mimeType: media.mimeType || 'application/octet-stream',
      contentDisposition,
    }),
    downloadName: media.fileName || media.description || 'fichier-projet',
    mimeType: media.mimeType || 'application/octet-stream',
  };
};

const mapProjectHistoryItem = (validation) => ({
  id: validation.id,
  itemType: 'PROJECT',
  targetType: 'PROJECT',
  targetId: validation.project?.id || null,
  title: validation.project?.title || 'Projet',
  description: validation.project?.description || '',
  student: mapStudentSummary(validation.project?.student),
  status: validation.decision,
  decision: validation.decision,
  actionLabel: getDecisionLabel(validation.decision),
  comment: validation.comment || validation.professorFeedback || null,
  decisionDate: validation.decisionDate,
  actionDate: validation.decisionDate,
  submittedAt: validation.project?.submittedAt || validation.project?.createdAt,
  targetStatus: validation.project?.validationStatus || null,
});

const mapInternshipHistoryItem = (validation) => ({
  id: validation.id,
  itemType: 'INTERNSHIP',
  targetType: 'INTERNSHIP',
  targetId: validation.internship?.id || null,
  title: validation.internship?.hostOrganization
    ? `Stage - ${validation.internship.hostOrganization}`
    : 'Stage',
  description: validation.internship?.missions || '',
  student: mapStudentSummary(validation.internship?.student),
  status: validation.decision,
  decision: validation.decision,
  actionLabel: getDecisionLabel(validation.decision),
  comment: validation.comment || null,
  decisionDate: validation.decisionDate,
  actionDate: validation.decisionDate,
  submittedAt: validation.internship?.startDate || validation.internship?.endDate,
  targetStatus: validation.internship?.validationStatus || null,
});

const sortHistoryByDecisionDate = (items) =>
  [...items].sort(
    (left, right) =>
      new Date(right.decisionDate || 0) - new Date(left.decisionDate || 0),
  );

const listProfessorValidationHistory = async (userId, filters = {}) => {
  const professor = await getProfessorByUserId(userId);
  const type = normalizeValidationType(filters.type);
  const status = normalizeValidationStatus(filters.status);
  const limit = Math.min(Math.max(Number(filters.limit) || 80, 1), 200);

  const where = {
    professorId: professor.id,
    ...(status ? { decision: status } : {}),
  };

  const loaders = [];

  if (!type || type === 'PROJECT') {
    loaders.push(
      prisma.projectValidation.findMany({
        where,
        orderBy: { decisionDate: 'desc' },
        take: limit,
        select: {
          id: true,
          decision: true,
          comment: true,
          professorFeedback: true,
          decisionDate: true,
          project: {
            select: {
              id: true,
              title: true,
              description: true,
              validationStatus: true,
              submittedAt: true,
              createdAt: true,
              student: {
                select: historyStudentSelect,
              },
            },
          },
        },
      }).then((items) => items.map(mapProjectHistoryItem)),
    );
  }

  if (!type || type === 'INTERNSHIP') {
    loaders.push(
      prisma.internshipValidation.findMany({
        where,
        orderBy: { decisionDate: 'desc' },
        take: limit,
        select: {
          id: true,
          decision: true,
          comment: true,
          decisionDate: true,
          internship: {
            select: {
              id: true,
              hostOrganization: true,
              missions: true,
              startDate: true,
              endDate: true,
              validationStatus: true,
              student: {
                select: historyStudentSelect,
              },
            },
          },
        },
      }).then((items) => items.map(mapInternshipHistoryItem)),
    );
  }

  const items = sortHistoryByDecisionDate(
    (await Promise.all(loaders)).flat(),
  )
    .filter((item) => historySearchMatches(item, filters.search))
    .slice(0, limit);

  return {
    filters: {
      type,
      status,
      search: filters.search || null,
      limit,
    },
    count: items.length,
    items,
  };
};

const getInternshipReportFile = async (professorId, internshipId) => {
  const internship = await getInternshipForProfessorOrThrow(professorId, internshipId);

  if (!internship.reportStoragePath) {
    throw new Error('PROFESSOR_VALIDATION_FILE_NOT_FOUND');
  }

  return {
    target: await getStageFileTarget(internship.reportStoragePath, {
      originalName: internship.reportFileName || 'rapport-stage.pdf',
      mimeType: internship.reportMimeType || 'application/pdf',
      contentDisposition: 'attachment',
    }),
    downloadName: internship.reportFileName || 'rapport-stage.pdf',
    mimeType: internship.reportMimeType || 'application/pdf',
  };
};

const getInternshipMediaFile = async (professorId, internshipId, mediaId, action) => {
  await getInternshipForProfessorOrThrow(professorId, internshipId);

  const media = await prisma.internshipMedia.findFirst({
    where: {
      id: mediaId,
      internshipId,
    },
    select: {
      id: true,
      mediaType: true,
      description: true,
      fileName: true,
      mimeType: true,
      storagePath: true,
    },
  });

  if (!media?.storagePath) {
    throw new Error('PROFESSOR_VALIDATION_FILE_NOT_FOUND');
  }

  const contentDisposition =
    action === 'content' && media.mediaType === 'IMAGE' ? 'inline' : 'attachment';

  return {
    target: await getStageFileTarget(media.storagePath, {
      originalName: media.fileName || media.description || 'fichier-stage',
      mimeType: media.mimeType || 'application/octet-stream',
      contentDisposition,
    }),
    downloadName: media.fileName || media.description || 'fichier-stage',
    mimeType: media.mimeType || 'application/octet-stream',
  };
};

const getProfessorValidationFile = async (
  userId,
  itemType,
  itemId,
  fileId,
  action = 'download',
) => {
  const professor = await getProfessorByUserId(userId);
  const type = normalizeValidationType(itemType);

  if (type === 'PROJECT') {
    return getProjectValidationFile(professor.id, itemId, fileId, action);
  }

  if (fileId === 'report') {
    return getInternshipReportFile(professor.id, itemId);
  }

  return getInternshipMediaFile(professor.id, itemId, fileId, action);
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
  getProfessorValidationFile,
  getProfessorValidationDetail,
  getProfessorValidationStats,
  listProfessorValidationHistory,
  listProfessorValidations,
  rejectProfessorValidation,
  requestProfessorValidationChanges,
};
