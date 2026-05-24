'use strict';

const prisma = require('../config/prisma');
const {
  formatFullName,
  mapProjectRecord,
  normalizeProjectType,
  projectSelect,
} = require('./student/projectMappers');

const normalizeOptionalText = (value) => {
  if (value === undefined) return undefined;

  const normalized = String(value || '').trim();
  return normalized || null;
};

const keepProjectMediaUrl = (value) => {
  const url = String(value || '').trim();

  if (!url || url === '#' || url.startsWith('blob:')) {
    return null;
  }

  return url;
};

const getStudentOrThrow = async (userId) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!student) {
    throw new Error('STUDENT_PROFILE_NOT_FOUND');
  }

  return student;
};

const professorValidatorSelect = {
  id: true,
  user: {
    select: {
      firstName: true,
      lastName: true,
    },
  },
};

const normalizeValidatorName = (name) =>
  String(name || '')
    .trim()
    .replace(/^(pr|prof|mme|mr|m)\.?\s+/i, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const findProfessorByName = async (validatorName) => {
  const requestedName = normalizeValidatorName(validatorName);

  if (!requestedName) return null;

  const professors = await prisma.professor.findMany({
    select: professorValidatorSelect,
  });

  return (
    professors.find((professor) => {
      const fullName = normalizeValidatorName(formatFullName(professor.user));
      const lastName = normalizeValidatorName(professor.user.lastName);

      return fullName === requestedName || lastName === requestedName;
    }) || null
  );
};

const resolveValidatorProfessorId = async (payload) => {
  if (payload.validatorId) {
    const professor = await prisma.professor.findUnique({
      where: { id: payload.validatorId },
      select: { id: true },
    });

    if (!professor) {
      throw new Error('PROJECT_VALIDATOR_NOT_FOUND');
    }

    return professor.id;
  }

  if (!payload.validatorName) {
    return undefined;
  }

  return (await findProfessorByName(payload.validatorName))?.id;
};

const getDefaultValidatorIdOrThrow = async () => {
  const professor = await prisma.professor.findFirst({
    orderBy: { id: 'asc' },
    select: { id: true },
  });

  if (!professor) {
    throw new Error('PROJECT_VALIDATOR_NOT_FOUND');
  }

  return professor.id;
};

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

const buildProjectMediaPayload = (payload) => {
  const media = [];
  const documentationUrl = keepProjectMediaUrl(payload.documentationUrl);
  const portfolioUrl = keepProjectMediaUrl(payload.portfolioUrl);

  if (documentationUrl) {
    media.push({
      mediaType: 'DOCUMENTATION',
      mediaUrl: documentationUrl,
      description: 'Documentation',
    });
  }

  if (portfolioUrl) {
    media.push({
      mediaType: 'PORTFOLIO',
      mediaUrl: portfolioUrl,
      description: 'Portfolio',
    });
  }

  (payload.extraLinks || []).forEach((link) => {
    const mediaUrl = keepProjectMediaUrl(link?.url);
    if (!mediaUrl) return;

    media.push({
      mediaType: 'LINK',
      mediaUrl,
      description: link.label || 'Lien complémentaire',
    });
  });

  (payload.screenshots || []).forEach((screenshot) => {
    if (screenshot?.id) return;

    const mediaUrl = keepProjectMediaUrl(
      screenshot?.imageUrl || screenshot?.url || screenshot?.mediaUrl,
    );
    if (!mediaUrl) return;

    media.push({
      mediaType: 'SCREENSHOT',
      mediaUrl,
      description: screenshot.title || 'Capture',
    });
  });

  (payload.attachments || []).forEach((attachment) => {
    if (attachment?.id) return;

    const mediaUrl = keepProjectMediaUrl(attachment?.url);
    if (!mediaUrl) return;

    media.push({
      mediaType: attachment.type || 'ATTACHMENT',
      mediaUrl,
      description: attachment.name || 'Pièce jointe',
    });
  });

  return media;
};

const buildProjectWriteData = async (payload) => {
  const technologyNames = Array.isArray(payload.technologies) ? payload.technologies : [];
  const technologyIds = (
    await Promise.all(technologyNames.map((name) => ensureTechnology(name)))
  ).filter(Boolean);
  const validatorProfessorId = await resolveValidatorProfessorId(payload);

  return {
    title: payload.title,
    description: payload.description,
    type: normalizeProjectType(payload.type),
    teamRole: payload.role || null,
    teamSize: normalizeOptionalText(payload.teamSize),
    validatorProfessorId,
    githubUrl: payload.githubUrl || null,
    youtubeUrl: payload.demoUrl || null,
    result: payload.result || null,
    generalFeedback: payload.validationComment || null,
    visibility: payload.visibility || 'PRIVATE',
    technologies: technologyIds.map((technologyId) => ({
      technology: {
        connect: { id: technologyId },
      },
    })),
    media: buildProjectMediaPayload(payload),
  };
};

exports.listProjects = async (userId) => {
  const student = await getStudentOrThrow(userId);
  const projects = await prisma.project.findMany({
    where: {
      studentId: student.id,
    },
    orderBy: [{ createdAt: 'desc' }],
    select: projectSelect,
  });

  return projects.map(mapProjectRecord);
};

exports.getProjectById = async (userId, projectId) => {
  const student = await getStudentOrThrow(userId);
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      studentId: student.id,
    },
    select: projectSelect,
  });

  if (!project) {
    throw new Error('PROJECT_NOT_FOUND');
  }

  return mapProjectRecord(project);
};

exports.createProject = async (userId, payload) => {
  const student = await getStudentOrThrow(userId);
  const data = await buildProjectWriteData(payload);

  const createdProject = await prisma.project.create({
    data: {
      studentId: student.id,
      title: data.title,
      description: data.description,
      type: data.type,
      teamRole: data.teamRole,
      teamSize: data.teamSize,
      validatorProfessorId: data.validatorProfessorId,
      githubUrl: data.githubUrl,
      youtubeUrl: data.youtubeUrl,
      result: data.result,
      generalFeedback: data.generalFeedback,
      visibility: data.visibility,
      validationStatus: 'DRAFT',
      technologies: {
        create: data.technologies,
      },
      media: {
        create: data.media,
      },
    },
    select: {
      id: true,
    },
  });

  return exports.getProjectById(userId, createdProject.id);
};

exports.updateProject = async (userId, projectId, payload) => {
  const student = await getStudentOrThrow(userId);
  const existingProject = await prisma.project.findFirst({
    where: {
      id: projectId,
      studentId: student.id,
    },
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      teamRole: true,
      teamSize: true,
      validatorProfessorId: true,
      githubUrl: true,
      youtubeUrl: true,
      result: true,
      generalFeedback: true,
      visibility: true,
    },
  });

  if (!existingProject) {
    throw new Error('PROJECT_NOT_FOUND');
  }

  const data = await buildProjectWriteData(payload);

  await prisma.project.update({
    where: { id: projectId },
    data: {
      title: data.title ?? existingProject.title,
      description: data.description ?? existingProject.description,
      type: data.type ?? existingProject.type,
      teamRole: data.teamRole ?? existingProject.teamRole,
      teamSize: data.teamSize ?? existingProject.teamSize,
      validatorProfessorId: data.validatorProfessorId ?? existingProject.validatorProfessorId,
      githubUrl: data.githubUrl ?? existingProject.githubUrl,
      youtubeUrl: data.youtubeUrl ?? existingProject.youtubeUrl,
      result: data.result ?? existingProject.result,
      generalFeedback: data.generalFeedback ?? existingProject.generalFeedback,
      visibility: data.visibility ?? existingProject.visibility,
      technologies: {
        deleteMany: {},
        create: data.technologies,
      },
      media: {
        deleteMany: {
          storagePath: null,
        },
        create: data.media,
      },
    },
  });

  return exports.getProjectById(userId, projectId);
};

exports.submitProject = async (userId, projectId) => {
  const student = await getStudentOrThrow(userId);
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      studentId: student.id,
    },
    select: {
      id: true,
      validationStatus: true,
      validatorProfessorId: true,
    },
  });

  if (!project) {
    throw new Error('PROJECT_NOT_FOUND');
  }

  const validatorProfessorId =
    project.validatorProfessorId || (await getDefaultValidatorIdOrThrow());

  await prisma.$transaction(async (tx) => {
    await tx.project.update({
      where: { id: projectId },
      data: {
        validationStatus: 'PENDING',
        validatorProfessorId,
        submittedAt: new Date(),
      },
    });

    const pendingValidation = await tx.projectValidation.findFirst({
      where: {
        projectId,
        professorId: validatorProfessorId,
        decision: 'PENDING',
      },
      select: { id: true },
    });

    if (!pendingValidation || project.validationStatus !== 'PENDING') {
      await tx.projectValidation.create({
        data: {
          projectId,
          professorId: validatorProfessorId,
          decision: 'PENDING',
          comment: 'Projet soumis pour validation.',
        },
      });
    }
  });

  return exports.getProjectById(userId, projectId);
};

exports.deleteProject = async (userId, projectId) => {
  const student = await getStudentOrThrow(userId);
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      studentId: student.id,
    },
    select: {
      id: true,
    },
  });

  if (!project) {
    throw new Error('PROJECT_NOT_FOUND');
  }

  await prisma.project.delete({
    where: { id: projectId },
  });

  return {
    deleted: true,
    id: projectId,
  };
};

