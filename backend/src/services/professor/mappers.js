'use strict';

const { formatFullName } = require('./helpers');

const formatTechnologyLabel = (item) => {
  const technology = item?.technology || item;
  if (!technology?.name) return null;

  return technology.version
    ? `${technology.name} ${technology.version}`
    : technology.name;
};

const mapUserSummary = (user) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  fullName: formatFullName(user),
  email: user.email,
  phone: user.phone,
  profilePicture: user.profilePicture,
  accountStatus: user.accountStatus,
  createdAt: user.createdAt,
  lastLoginAt: user.lastLoginAt,
});

const mapStudentSummary = (student) => {
  const user = student?.user;

  return {
    id: student?.id || null,
    fullName: user ? formatFullName(user) : 'Etudiant inconnu',
    email: user?.email || null,
    phone: user?.phone || null,
    profilePicture: user?.profilePicture || null,
    field: student?.major || null,
    level: student?.level || null,
    city: student?.city || null,
    apogeeCode: student?.apogeeCode || null,
    cne: student?.cne || null,
  };
};

const mapProfessorSnapshot = (professor) => ({
  id: professor.id,
  userId: professor.userId,
  employeeId: professor.employeeId,
  grade: professor.grade,
  specialty: professor.specialty,
  department: professor.department,
});

const extractFileName = (url, fallbackName) => {
  if (!url) return fallbackName;

  try {
    const pathname = new URL(url).pathname;
    return pathname.split('/').filter(Boolean).pop() || fallbackName;
  } catch {
    return String(url).split('/').filter(Boolean).pop() || fallbackName;
  }
};

const mapMediaFile = (media, fallbackName) => ({
  id: media.id,
  name:
    media.fileName ||
    media.description ||
    extractFileName(media.mediaUrl, fallbackName),
  type: media.mediaType,
  mimeType: media.mimeType || '',
  size: media.fileSize || null,
  url: media.mediaUrl,
});

const mapProjectFiles = (media = []) =>
  media
    .filter((item) => item?.mediaUrl)
    .map((item, index) => mapMediaFile(item, `project-file-${index + 1}`));

const mapInternshipFiles = (internship) => {
  const report = internship.reportUrl
    ? [
        {
          id: `${internship.id}-report`,
          name:
            internship.reportFileName ||
            extractFileName(internship.reportUrl, 'rapport-stage'),
          type: 'REPORT',
          mimeType: internship.reportMimeType || 'application/pdf',
          size: internship.reportFileSize || null,
          url: internship.reportUrl,
        },
      ]
    : [];

  const images = (internship.media || [])
    .filter((item) => item?.mediaUrl)
    .map((item, index) => mapMediaFile(item, `stage-media-${index + 1}`));

  return [...report, ...images];
};

const mapProjectValidationItem = (project) => {
  const technologies = (project.technologies || [])
    .map(formatTechnologyLabel)
    .filter(Boolean);

  return {
    id: project.id,
    itemType: 'PROJECT',
    targetType: 'PROJECT',
    targetId: project.id,
    title: project.title,
    description: project.description,
    student: mapStudentSummary(project.student),
    status: project.validationStatus,
    submittedAt: project.submittedAt || project.createdAt,
    createdAt: project.createdAt,
    content: {
      title: project.title,
      description: project.description,
      files: mapProjectFiles(project.media),
    },
    targetDetails: {
      projectType: project.type,
      teamRole: project.teamRole,
      teamSize: project.teamSize,
      technologies,
      visibility: project.visibility,
      githubUrl: project.githubUrl,
      demoUrl: project.youtubeUrl,
      result: project.result,
      feedback: project.generalFeedback,
      createdAt: project.createdAt,
    },
  };
};

const mapInternshipValidationItem = (internship) => {
  const technologies = (internship.technologies || [])
    .map(formatTechnologyLabel)
    .filter(Boolean);

  return {
    id: internship.id,
    itemType: 'INTERNSHIP',
    targetType: 'INTERNSHIP',
    targetId: internship.id,
    title: internship.hostOrganization
      ? `Stage - ${internship.hostOrganization}`
      : 'Stage',
    description: internship.missions || 'Stage soumis pour validation.',
    student: mapStudentSummary(internship.student),
    status: internship.validationStatus,
    submittedAt: internship.startDate || internship.endDate,
    createdAt: internship.startDate || internship.endDate,
    content: {
      title: internship.hostOrganization || 'Stage',
      description: internship.missions,
      files: mapInternshipFiles(internship),
    },
    targetDetails: {
      company: internship.hostOrganization,
      duration: internship.duration,
      startDate: internship.startDate,
      endDate: internship.endDate,
      technologies,
      visibility: internship.visibility,
    },
  };
};

const mapReviewActivity = (validation, type) => ({
  id: validation.id,
  reviewType: type,
  decision: validation.decision,
  decisionDate: validation.decisionDate,
  label:
    type === 'PROJECT'
      ? validation.project?.title || 'Projet'
      : validation.internship?.hostOrganization || 'Stage',
  studentName:
    type === 'PROJECT'
      ? validation.project?.student?.user
        ? formatFullName(validation.project.student.user)
        : null
      : validation.internship?.student?.user
        ? formatFullName(validation.internship.student.user)
        : null,
});

module.exports = {
  mapInternshipValidationItem,
  mapProfessorSnapshot,
  mapProjectValidationItem,
  mapReviewActivity,
  mapStudentSummary,
  mapUserSummary,
};
