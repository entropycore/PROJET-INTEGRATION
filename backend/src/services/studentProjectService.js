'use strict';

const prisma = require('../config/prisma');

const PROJECT_TYPE_LABELS = {
  MODULE: 'Module',
  INTEGRATION: 'Intégration',
  HACKATHON: 'Hackathon',
  PERSONAL: 'Personnel',
  INTERNSHIP: 'Stage',
};

const PROJECT_TYPE_BY_LABEL = {
  Module: 'MODULE',
  'Intégration': 'INTEGRATION',
  Integration: 'INTEGRATION',
  Hackathon: 'HACKATHON',
  Personnel: 'PERSONAL',
  Stage: 'INTERNSHIP',
};

const projectSelect = {
  id: true,
  studentId: true,
  title: true,
  description: true,
  type: true,
  teamRole: true,
  githubUrl: true,
  youtubeUrl: true,
  result: true,
  generalFeedback: true,
  visibility: true,
  validationStatus: true,
  createdAt: true,
  submittedAt: true,
  media: {
    orderBy: {
      id: 'asc',
    },
    select: {
      id: true,
      mediaType: true,
      mediaUrl: true,
      description: true,
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
          version: true,
          category: true,
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
      professorFeedback: true,
      decisionDate: true,
      professor: {
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
    },
  },
};

const formatFullName = (user) => `${user.firstName} ${user.lastName}`.trim();

const mapProjectTypeLabel = (type) => PROJECT_TYPE_LABELS[type] || type;

const normalizeProjectType = (type) => {
  if (!type) return 'MODULE';
  if (PROJECT_TYPE_LABELS[type]) return type;

  const normalized = PROJECT_TYPE_BY_LABEL[type];
  if (!normalized) {
    throw new Error('INVALID_PROJECT_TYPE');
  }

  return normalized;
};

const mapValidationTitle = (decision) => {
  const titles = {
    PENDING: 'Projet soumis',
    APPROVED: 'Projet validé',
    REJECTED: 'Projet refusé',
    CHANGES_REQUESTED: 'Corrections demandées',
  };

  return titles[decision] || 'Mise à jour du projet';
};

const splitProjectMedia = (media) => {
  const bucket = {
    documentationUrl: null,
    portfolioUrl: null,
    extraLinks: [],
    screenshots: [],
    attachments: [],
  };

  media.forEach((item) => {
    const mediaType = String(item.mediaType || '').toUpperCase();

    if (mediaType === 'DOCUMENTATION') {
      bucket.documentationUrl = bucket.documentationUrl || item.mediaUrl;
      return;
    }

    if (mediaType === 'PORTFOLIO') {
      bucket.portfolioUrl = bucket.portfolioUrl || item.mediaUrl;
      return;
    }

    if (mediaType === 'LINK') {
      bucket.extraLinks.push({
        id: item.id,
        label: item.description || 'Lien complémentaire',
        url: item.mediaUrl,
      });
      return;
    }

    if (mediaType === 'SCREENSHOT' || mediaType === 'IMAGE') {
      bucket.screenshots.push({
        id: item.id,
        title: item.description || 'Capture',
        imageUrl: item.mediaUrl,
      });
      return;
    }

    bucket.attachments.push({
      id: item.id,
      name: item.description || 'Pièce jointe',
      type: mediaType || 'ATTACHMENT',
      url: item.mediaUrl,
    });
  });

  return bucket;
};

const mapProjectRecord = (project) => {
  const latestValidation = project.validations[0] || null;
  const media = splitProjectMedia(project.media);

  return {
    id: project.id,
    title: project.title,
    description: project.description,
    type: mapProjectTypeLabel(project.type),
    role: project.teamRole || '',
    teamSize: null,
    validationStatus: project.validationStatus,
    visibility: project.visibility,
    createdAt: project.createdAt,
    submittedAt: project.submittedAt,
    technologies: project.technologies.map((item) => item.technology.name),
    githubUrl: project.githubUrl,
    demoUrl: project.youtubeUrl,
    documentationUrl: media.documentationUrl,
    portfolioUrl: media.portfolioUrl,
    extraLinks: media.extraLinks,
    screenshots: media.screenshots,
    attachments: media.attachments,
    validatorName: latestValidation ? formatFullName(latestValidation.professor.user) : '',
    validationComment: latestValidation?.professorFeedback || latestValidation?.comment || '',
    validationHistory: project.validations.map((validation) => ({
      id: validation.id,
      title: mapValidationTitle(validation.decision),
      comment: validation.professorFeedback || validation.comment || '',
      actorName: formatFullName(validation.professor.user),
      actorRole: 'Validateur académique',
      createdAt: validation.decisionDate,
      status: validation.decision,
    })),
  };
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

  if (payload.documentationUrl) {
    media.push({
      mediaType: 'DOCUMENTATION',
      mediaUrl: payload.documentationUrl,
      description: 'Documentation',
    });
  }

  if (payload.portfolioUrl) {
    media.push({
      mediaType: 'PORTFOLIO',
      mediaUrl: payload.portfolioUrl,
      description: 'Portfolio',
    });
  }

  (payload.extraLinks || []).forEach((link) => {
    if (!link?.url) return;
    media.push({
      mediaType: 'LINK',
      mediaUrl: link.url,
      description: link.label || 'Lien complémentaire',
    });
  });

  (payload.screenshots || []).forEach((screenshot) => {
    const mediaUrl = screenshot?.imageUrl || screenshot?.url || screenshot?.mediaUrl;
    if (!mediaUrl) return;

    media.push({
      mediaType: 'SCREENSHOT',
      mediaUrl,
      description: screenshot.title || 'Capture',
    });
  });

  (payload.attachments || []).forEach((attachment) => {
    if (!attachment?.url) return;

    media.push({
      mediaType: attachment.type || 'ATTACHMENT',
      mediaUrl: attachment.url,
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

  return {
    title: payload.title,
    description: payload.description,
    type: normalizeProjectType(payload.type),
    teamRole: payload.role || null,
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
        deleteMany: {},
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
    },
  });

  if (!project) {
    throw new Error('PROJECT_NOT_FOUND');
  }

  await prisma.project.update({
    where: { id: projectId },
    data: {
      validationStatus: 'PENDING',
      submittedAt: new Date(),
    },
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
