'use strict';

const PROJECT_TYPE_LABELS = {
  MODULE: 'Module',
  INTEGRATION: 'Integration',
  HACKATHON: 'Hackathon',
  PERSONAL: 'Personnel',
  INTERNSHIP: 'Stage',
};

const PROJECT_TYPE_BY_LABEL = {
  Module: 'MODULE',
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
  teamSize: true,
  validatorProfessorId: true,
  githubUrl: true,
  youtubeUrl: true,
  result: true,
  generalFeedback: true,
  visibility: true,
  validationStatus: true,
  createdAt: true,
  submittedAt: true,
  media: {
    orderBy: { id: 'asc' },
    select: {
      id: true,
      mediaType: true,
      mediaUrl: true,
      description: true,
      fileName: true,
      storagePath: true,
    },
  },
  validatorProfessor: {
    select: {
      id: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  },
  technologies: {
    orderBy: { id: 'asc' },
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
    orderBy: { decisionDate: 'desc' },
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
    APPROVED: 'Projet valide',
    REJECTED: 'Projet refuse',
    CHANGES_REQUESTED: 'Corrections demandees',
  };

  return titles[decision] || 'Mise a jour du projet';
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
        label: item.description || 'Lien complementaire',
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
      name: item.fileName || item.description || 'Piece jointe',
      type: mediaType || 'ATTACHMENT',
      url: item.mediaUrl,
    });
  });

  return bucket;
};

const mapProjectRecord = (project) => {
  const latestValidation = project.validations[0] || null;
  const validator = project.validatorProfessor || latestValidation?.professor || null;
  const media = splitProjectMedia(project.media);

  return {
    id: project.id,
    title: project.title,
    description: project.description,
    type: mapProjectTypeLabel(project.type),
    role: project.teamRole || '',
    teamSize: project.teamSize || '',
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
    result: project.result || '',
    feedback: project.generalFeedback || latestValidation?.comment || '',
    validator: validator
      ? {
          id: validator.id,
          fullName: formatFullName(validator.user),
          department: validator.department || '',
        }
      : null,
    validationHistory: project.validations.map((validation) => ({
      id: validation.id,
      title: mapValidationTitle(validation.decision),
      status: validation.decision,
      comment: validation.comment || validation.professorFeedback || '',
      createdAt: validation.decisionDate,
      validator: validation.professor
        ? {
            id: validation.professor.id,
            fullName: formatFullName(validation.professor.user),
            department: validation.professor.department || '',
          }
        : null,
    })),
  };
};

module.exports = {
  formatFullName,
  mapProjectRecord,
  normalizeProjectType,
  projectSelect,
};
