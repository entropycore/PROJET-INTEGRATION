'use strict';

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
  reportFileName: true,
  reportMimeType: true,
  reportFileSize: true,
  reportStoragePath: true,
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
    orderBy: { id: 'asc' },
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
    orderBy: { decisionDate: 'desc' },
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
  media: {
    orderBy: { id: 'asc' },
    select: {
      id: true,
      mediaType: true,
      mediaUrl: true,
      description: true,
      fileName: true,
      mimeType: true,
      fileSize: true,
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
    title: internship.hostOrganization ? `Stage chez ${internship.hostOrganization}` : 'Stage',
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
  } catch {
    return fallback;
  }

  return fallback;
};

const encodeInternshipContent = (payload) =>
  JSON.stringify({
    version: CONTENT_VERSION,
    title: payload.title || '',
    description: payload.description || '',
    missions: Array.isArray(payload.missions) ? payload.missions : splitLines(payload.missions),
    supervisor: payload.supervisor || {
      fullName: '',
      department: '',
    },
  });

const mapValidationTitle = (decision) => {
  const titles = {
    PENDING: 'Stage soumis',
    APPROVED: 'Stage valide',
    REJECTED: 'Stage refusé',
    CHANGES_REQUESTED: 'Corrections demandees',
  };

  return titles[decision] || 'Mise a jour du stage';
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
    report: internship.reportUrl
      ? {
          url: internship.reportUrl,
          fileName: internship.reportFileName || 'rapport-stage.pdf',
          mimeType: internship.reportMimeType || 'application/pdf',
          fileSize: internship.reportFileSize || null,
        }
      : null,
    images: internship.media.map((media) => ({
      id: media.id,
      title: media.description || media.fileName || 'Capture',
      imageUrl: media.mediaUrl,
      mimeType: media.mimeType,
      fileSize: media.fileSize,
    })),
    validationHistory: internship.validations.map((validation) => ({
      id: validation.id,
      status: validation.decision,
      comment: validation.comment || '',
      createdAt: validation.decisionDate,
      title: mapValidationTitle(validation.decision),
      actorName: formatFullName(validation.professor.user),
      actorRole: 'Encadrant academique',
    })),
  };
};

module.exports = {
  decodeInternshipContent,
  encodeInternshipContent,
  formatFullName,
  internshipSelect,
  mapInternshipRecord,
};
