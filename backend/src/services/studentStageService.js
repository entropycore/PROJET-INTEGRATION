'use strict';

const prisma = require('../config/prisma');

const CONTENT_VERSION = 1;

const internshipSelect = {
  id: true,
  studentId: true,
  hostOrganization: true,
  duration: true,
  startDate: true,
  endDate: true,
  missions: true,
  reportUrl: true,
  validationStatus: true,
  visibility: true,
  supervisorProfessor: {
    select: {
      id: true,
      department: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  },
  technologies: {
    orderBy: {
      id: 'asc',
    },
    select: {
      technology: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  validations: {
    orderBy: {
      decisionDate: 'desc',
    },
    select: {
      id: true,
      decision: true,
      comment: true,
      decisionDate: true,
      professor: {
        select: {
          department: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  },
};

const formatFullName = (user) => `${user.firstName} ${user.lastName}`.trim();

const splitLines = (value) =>
  String(value || '')
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

const decodeInternshipContent = (rawValue, internship) => {
  const fallback = {
    title: internship.hostOrganization
      ? `Stage chez ${internship.hostOrganization}`
      : 'Stage',
    description: rawValue || '',
    missions: splitLines(rawValue),
    supervisor: internship.supervisorProfessor
      ? {
          fullName: formatFullName(internship.supervisorProfessor.user),
          department: internship.supervisorProfessor.department || '',
        }
      : {
          fullName: '',
          department: '',
        },
  };

  if (!rawValue) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(rawValue);

    if (parsed && parsed.version === CONTENT_VERSION) {
      return {
        title: parsed.title || fallback.title,
        description: parsed.description || '',
        missions: Array.isArray(parsed.missions) ? parsed.missions : [],
        supervisor: parsed.supervisor || fallback.supervisor,
      };
    }
  } catch (error) {
    return fallback;
  }

  return fallback;
};

const encodeInternshipContent = (payload) =>
  JSON.stringify({
    version: CONTENT_VERSION,
    title: payload.title || '',
    description: payload.description || '',
    missions: Array.isArray(payload.missions)
      ? payload.missions
      : splitLines(payload.missions),
    supervisor: payload.supervisor || {
      fullName: '',
      department: '',
    },
  });

const ensureTechnology = async (name) => {
  const normalizedName = String(name || '').trim();

  if (!normalizedName) return null;

  const existing = await prisma.technology.findFirst({
    where: {
      name: normalizedName,
      version: null,
    },
    select: {
      id: true,
    },
  });

  if (existing) return existing.id;

  const created = await prisma.technology.create({
    data: {
      name: normalizedName,
    },
    select: {
      id: true,
    },
  });

  return created.id;
};

const resolveSupervisorProfessorId = async (supervisor) => {
  const supervisorName = String(supervisor?.fullName || '').trim();

  if (!supervisorName) return null;

  const professors = await prisma.professor.findMany({
    select: {
      id: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  const match = professors.find(
    (professor) => formatFullName(professor.user).toLowerCase() === supervisorName.toLowerCase(),
  );

  return match?.id || null;
};

const mapValidationTitle = (decision) => {
  const titles = {
    PENDING: 'Stage soumis',
    APPROVED: 'Stage validé',
    REJECTED: 'Stage refusé',
    CHANGES_REQUESTED: 'Correction demandée',
  };

  return titles[decision] || 'Mise à jour du stage';
};

const mapInternshipRecord = (internship) => {
  const content = decodeInternshipContent(internship.missions, internship);
  const supervisorFromRelation = internship.supervisorProfessor
    ? {
        fullName: formatFullName(internship.supervisorProfessor.user),
        department: internship.supervisorProfessor.department || '',
      }
    : null;

  return {
    id: internship.id,
    title: content.title,
    company: internship.hostOrganization,
    duration: internship.duration || '',
    startDate: internship.startDate,
    endDate: internship.endDate,
    description: content.description,
    missions: content.missions,
    supervisor: supervisorFromRelation || content.supervisor,
    technologies: internship.technologies.map((item) => item.technology.name),
    visibility: internship.visibility,
    validationStatus: internship.validationStatus,
    reportUrl: internship.reportUrl || '',
    images: [],
    validationHistory: internship.validations.map((validation) => ({
      id: validation.id,
      status: validation.decision,
      comment: validation.comment || '',
      createdAt: validation.decisionDate,
      title: mapValidationTitle(validation.decision),
      actorName: formatFullName(validation.professor.user),
      actorRole: 'Encadrant académique',
    })),
  };
};

const getStudentOrThrow = async (userId) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: {
      id: true,
    },
  });

  if (!student) {
    throw new Error('STUDENT_PROFILE_NOT_FOUND');
  }

  return student;
};

exports.listStages = async (userId) => {
  const student = await getStudentOrThrow(userId);
  const internships = await prisma.internship.findMany({
    where: {
      studentId: student.id,
    },
    orderBy: [{ startDate: 'desc' }, { endDate: 'desc' }],
    select: internshipSelect,
  });

  return internships.map(mapInternshipRecord);
};

exports.getStageById = async (userId, internshipId) => {
  const student = await getStudentOrThrow(userId);
  const internship = await prisma.internship.findFirst({
    where: {
      id: internshipId,
      studentId: student.id,
    },
    select: internshipSelect,
  });

  if (!internship) {
    throw new Error('STAGE_NOT_FOUND');
  }

  return mapInternshipRecord(internship);
};

exports.createStage = async (userId, payload) => {
  const student = await getStudentOrThrow(userId);
  const technologyIds = (
    await Promise.all((payload.technologies || []).map((name) => ensureTechnology(name)))
  ).filter(Boolean);
  const supervisorProfessorId = await resolveSupervisorProfessorId(payload.supervisor);

  const created = await prisma.internship.create({
    data: {
      studentId: student.id,
      hostOrganization: payload.company,
      duration: payload.duration || null,
      startDate: payload.startDate ? new Date(payload.startDate) : null,
      endDate: payload.endDate ? new Date(payload.endDate) : null,
      missions: encodeInternshipContent(payload),
      reportUrl: payload.reportUrl || null,
      visibility: payload.visibility || 'PRIVATE',
      validationStatus: 'DRAFT',
      supervisorProfessorId,
      technologies: {
        create: technologyIds.map((technologyId) => ({
          technology: {
            connect: { id: technologyId },
          },
        })),
      },
    },
    select: {
      id: true,
    },
  });

  return exports.getStageById(userId, created.id);
};

exports.updateStage = async (userId, internshipId, payload) => {
  const student = await getStudentOrThrow(userId);
  const existing = await prisma.internship.findFirst({
    where: {
      id: internshipId,
      studentId: student.id,
    },
    select: {
      id: true,
      hostOrganization: true,
      duration: true,
      startDate: true,
      endDate: true,
      missions: true,
      reportUrl: true,
      visibility: true,
    },
  });

  if (!existing) {
    throw new Error('STAGE_NOT_FOUND');
  }

  const technologyIds = (
    await Promise.all((payload.technologies || []).map((name) => ensureTechnology(name)))
  ).filter(Boolean);
  const supervisorProfessorId = await resolveSupervisorProfessorId(payload.supervisor);

  await prisma.internship.update({
    where: { id: internshipId },
    data: {
      hostOrganization: payload.company ?? existing.hostOrganization,
      duration: payload.duration ?? existing.duration,
      startDate: payload.startDate ? new Date(payload.startDate) : existing.startDate,
      endDate: payload.endDate ? new Date(payload.endDate) : existing.endDate,
      missions: encodeInternshipContent({
        ...decodeInternshipContent(existing.missions, {
          hostOrganization: existing.hostOrganization,
        }),
        ...payload,
      }),
      reportUrl: payload.reportUrl ?? existing.reportUrl,
      visibility: payload.visibility ?? existing.visibility,
      supervisorProfessorId,
      technologies: {
        deleteMany: {},
        create: technologyIds.map((technologyId) => ({
          technology: {
            connect: { id: technologyId },
          },
        })),
      },
    },
  });

  return exports.getStageById(userId, internshipId);
};

exports.deleteStage = async (userId, internshipId) => {
  const student = await getStudentOrThrow(userId);
  const existing = await prisma.internship.findFirst({
    where: {
      id: internshipId,
      studentId: student.id,
    },
    select: {
      id: true,
    },
  });

  if (!existing) {
    throw new Error('STAGE_NOT_FOUND');
  }

  await prisma.internship.delete({
    where: { id: internshipId },
  });

  return {
    deleted: true,
    id: internshipId,
  };
};

exports.submitStageValidation = async (userId, internshipId) => {
  const student = await getStudentOrThrow(userId);
  const existing = await prisma.internship.findFirst({
    where: {
      id: internshipId,
      studentId: student.id,
    },
    select: {
      id: true,
    },
  });

  if (!existing) {
    throw new Error('STAGE_NOT_FOUND');
  }

  await prisma.internship.update({
    where: { id: internshipId },
    data: {
      validationStatus: 'PENDING',
    },
  });

  return exports.getStageById(userId, internshipId);
};

exports.updateStageVisibility = async (userId, internshipId, visibility) => {
  const student = await getStudentOrThrow(userId);
  const existing = await prisma.internship.findFirst({
    where: {
      id: internshipId,
      studentId: student.id,
    },
    select: {
      id: true,
    },
  });

  if (!existing) {
    throw new Error('STAGE_NOT_FOUND');
  }

  await prisma.internship.update({
    where: { id: internshipId },
    data: {
      visibility,
    },
  });

  return exports.getStageById(userId, internshipId);
};

exports.updateStageReport = async (userId, internshipId, payload) => {
  const student = await getStudentOrThrow(userId);
  const existing = await prisma.internship.findFirst({
    where: {
      id: internshipId,
      studentId: student.id,
    },
    select: {
      id: true,
    },
  });

  if (!existing) {
    throw new Error('STAGE_NOT_FOUND');
  }

  await prisma.internship.update({
    where: { id: internshipId },
    data: {
      reportUrl: payload.reportUrl || null,
    },
  });

  return exports.getStageById(userId, internshipId);
};

exports.getStageValidationHistory = async (userId, internshipId) => {
  const stage = await exports.getStageById(userId, internshipId);
  return stage.validationHistory;
};

exports.addStageTechnologies = async (userId, internshipId, technologyIds = []) => {
  const student = await getStudentOrThrow(userId);
  const existing = await prisma.internship.findFirst({
    where: {
      id: internshipId,
      studentId: student.id,
    },
    select: {
      id: true,
    },
  });

  if (!existing) {
    throw new Error('STAGE_NOT_FOUND');
  }

  for (const technologyId of technologyIds) {
    await prisma.internshipTechnology.upsert({
      where: {
        internshipId_technologyId: {
          internshipId,
          technologyId,
        },
      },
      update: {},
      create: {
        internshipId,
        technologyId,
      },
    });
  }

  return exports.getStageById(userId, internshipId);
};

exports.removeStageTechnology = async (userId, internshipId, technologyId) => {
  const student = await getStudentOrThrow(userId);
  const existing = await prisma.internship.findFirst({
    where: {
      id: internshipId,
      studentId: student.id,
    },
    select: {
      id: true,
    },
  });

  if (!existing) {
    throw new Error('STAGE_NOT_FOUND');
  }

  await prisma.internshipTechnology.deleteMany({
    where: {
      internshipId,
      technologyId,
    },
  });

  return exports.getStageById(userId, internshipId);
};
