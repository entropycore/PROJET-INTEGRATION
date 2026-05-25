'use strict';

// Helpers communs aux modules studentWorkspace. Les actions metier sont
// reparties dans les fichiers *Service.js du meme dossier.

const bcrypt = require('bcrypt');
const crypto = require('crypto');

const prisma = require('../../config/prisma');

const VALID_VISIBILITIES = new Set(['PUBLIC', 'PRIVATE', 'TEACHERS', 'SHARED_LINK']);
const VALID_RECOMMENDATION_STATUSES = new Set(['PENDING', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED']);
const VALID_PROJECT_TYPES = new Set(['MODULE', 'INTEGRATION', 'HACKATHON', 'PERSONAL', 'INTERNSHIP']);
const VALID_ACTIVITY_TYPES = new Set([
  'CLUB',
  'EVENT',
  'HACKATHON',
  'COMPETITION',
  'ASSOCIATIVE_ENGAGEMENT',
  'CONFERENCE',
  'VOLUNTEERING',
  'TRAINING',
  'OTHER',
]);

const serviceError = (message, status = 400) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const toEnum = (value, fallback, allowedValues) => {
  const normalized = String(value || fallback).trim().toUpperCase().replace(/-/g, '_');
  return allowedValues.has(normalized) ? normalized : fallback;
};

const toDate = (value) => (value ? new Date(value) : null);

const isPlainObject = (value) =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const normalizePreferences = (preferences) =>
  isPlainObject(preferences)
    ? preferences
    : {
        schema_version: 1,
      };

const requireBoolean = (value, code) => {
  if (typeof value !== 'boolean') throw serviceError(code, 400);
  return value;
};

const toRecommendationUiStatus = (status) => {
  if (status === 'APPROVED') return 'RECEIVED';
  if (status === 'CHANGES_REQUESTED') return 'PENDING';
  return status;
};

const fromRecommendationUiStatus = (status) => {
  const normalized = String(status || '').trim().toUpperCase().replace(/-/g, '_');
  if (!normalized || normalized === 'ALL') return null;
  if (normalized === 'RECEIVED') return 'APPROVED';
  return normalized;
};

const getInitials = (name) =>
  String(name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || '?';

const getStudentOrThrow = async (userId) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: { user: true },
  });

  if (!student) throw serviceError('STUDENT_PROFILE_NOT_FOUND', 404);
  return student;
};

const ensureProjectOwner = async (userId, projectId) => {
  const student = await getStudentOrThrow(userId);
  const project = await prisma.project.findFirst({
    where: { id: projectId, studentId: student.id },
  });

  if (!project) throw serviceError('PROJECT_NOT_FOUND', 404);
  return { student, project };
};

const ensureInternshipOwner = async (userId, internshipId) => {
  const student = await getStudentOrThrow(userId);
  const internship = await prisma.internship.findFirst({
    where: { id: internshipId, studentId: student.id },
  });

  if (!internship) throw serviceError('STAGE_NOT_FOUND', 404);
  return { student, internship };
};

const ensureActivityOwner = async (userId, activityId) => {
  const student = await getStudentOrThrow(userId);
  const activity = await prisma.extracurricularActivity.findFirst({
    where: { id: activityId, studentId: student.id },
  });

  if (!activity) throw serviceError('ACTIVITY_NOT_FOUND', 404);
  return { student, activity };
};

const projectInclude = {
  validatorProfessor: { include: { user: true } },
  media: true,
  validations: {
    include: { professor: { include: { user: true } } },
    orderBy: { decisionDate: 'desc' },
  },
  technologies: { include: { technology: true } },
};

const internshipInclude = {
  supervisorProfessor: { include: { user: true } },
  media: true,
  validations: {
    include: { professor: { include: { user: true } } },
    orderBy: { decisionDate: 'desc' },
  },
  technologies: { include: { technology: true } },
};

const activityInclude = {
  certificates: { orderBy: { submittedAt: 'desc' } },
};

const fullName = (user) => `${user?.firstName || ''} ${user?.lastName || ''}`.trim();

const recommendationInclude = {
  authorUser: true,
  validatorUser: true,
  portfolio: true,
};

const mapStudentRecommendation = (recommendation) => {
  const authorName = fullName(recommendation.authorUser) || 'Auteur inconnu';
  const uiStatus = toRecommendationUiStatus(recommendation.status);

  return {
    id: recommendation.id,
    title: recommendation.title,
    content: recommendation.content,
    status: uiStatus,
    validationStatus: recommendation.status,
    visibility: recommendation.visibility,
    createdAt: recommendation.createdAt,
    validatedAt: recommendation.validatedAt,
    rejectionReason: recommendation.rejectionReason,
    organization: recommendation.organization,
    recommendationType: recommendation.recommendationType,
    portfolio: recommendation.portfolio
      ? {
          id: recommendation.portfolio.id,
          title: recommendation.portfolio.title,
          publicSlug: recommendation.portfolio.publicSlug,
        }
      : null,
    author: {
      id: recommendation.authorUser?.id || null,
      name: authorName,
      fullName: authorName,
      initials: getInitials(authorName),
      email: recommendation.authorUser?.email || null,
      role: recommendation.authorJobTitle || recommendation.recommendationType || 'Auteur',
      organization: recommendation.organization || '',
      profilePicture: recommendation.authorUser?.profilePicture || null,
    },
    validator: recommendation.validatorUser
      ? {
          id: recommendation.validatorUser.id,
          fullName: fullName(recommendation.validatorUser),
          email: recommendation.validatorUser.email,
        }
      : null,
  };
};

const mapProjectMedia = (media) => ({
  id: media.id,
  title: media.fileName || media.description || media.mediaType,
  type: media.mediaType,
  url: media.mediaUrl,
  mediaUrl: media.mediaUrl,
  fileName: media.fileName,
  mimeType: media.mimeType,
  fileSize: media.fileSize,
});

const mapProject = (project) => {
  const validator = project.validatorProfessor?.user;
  const media = project.media || [];

  return {
    id: project.id,
    title: project.title,
    description: project.description,
    type: project.type,
    role: project.teamRole,
    teamRole: project.teamRole,
    teamSize: project.teamSize,
    validatorId: project.validatorProfessorId,
    validatorName: validator ? fullName(validator) : null,
    githubUrl: project.githubUrl,
    youtubeUrl: project.youtubeUrl,
    result: project.result,
    generalFeedback: project.generalFeedback,
    validationStatus: project.validationStatus,
    visibility: project.visibility,
    createdAt: project.createdAt,
    submittedAt: project.submittedAt,
    technologies: (project.technologies || []).map((item) => item.technology.name),
    screenshots: media.filter((item) => item.mediaType === 'SCREENSHOT').map(mapProjectMedia),
    attachments: media.filter((item) => item.mediaType !== 'SCREENSHOT').map(mapProjectMedia),
    validationHistory: (project.validations || []).map((validation) => ({
      id: validation.id,
      decision: validation.decision,
      comment: validation.comment,
      professorFeedback: validation.professorFeedback,
      decisionDate: validation.decisionDate,
      validatorName: fullName(validation.professor?.user),
    })),
  };
};

const mapInternshipMedia = (media) => ({
  id: media.id,
  title: media.fileName || media.description || media.mediaType,
  url: media.mediaUrl,
  mediaUrl: media.mediaUrl,
  fileName: media.fileName,
  mimeType: media.mimeType,
  fileSize: media.fileSize,
});

const mapInternship = (internship) => {
  const supervisorUser = internship.supervisorProfessor?.user;

  return {
    id: internship.id,
    title: internship.hostOrganization,
    company: internship.hostOrganization,
    hostOrganization: internship.hostOrganization,
    duration: internship.duration,
    startDate: internship.startDate,
    endDate: internship.endDate,
    description: internship.missions,
    missions: internship.missions
      ? internship.missions.split('\n').map((mission) => mission.trim()).filter(Boolean)
      : [],
    reportUrl: internship.reportUrl,
    validationStatus: internship.validationStatus,
    visibility: internship.visibility,
    supervisor: internship.supervisorProfessor
      ? {
          id: internship.supervisorProfessor.id,
          fullName: fullName(supervisorUser),
          email: supervisorUser?.email || null,
          department: internship.supervisorProfessor.department,
          specialty: internship.supervisorProfessor.specialty,
        }
      : null,
    technologies: (internship.technologies || []).map((item) => item.technology.name),
    images: (internship.media || []).map(mapInternshipMedia),
    validationHistory: (internship.validations || []).map((validation) => ({
      id: validation.id,
      decision: validation.decision,
      comment: validation.comment,
      decisionDate: validation.decisionDate,
      validatorName: fullName(validation.professor?.user),
    })),
  };
};

const mapActivity = (activity) => {
  const certificate = activity.certificates?.[0] || null;

  return {
    id: activity.id,
    title: activity.title,
    type: activity.type,
    organization: activity.organization,
    date: activity.startDate,
    startDate: activity.startDate,
    endDate: activity.endDate,
    duration: activity.duration,
    location: activity.location,
    description: activity.description,
    visibility: activity.visibility,
    validationStatus: activity.validationStatus,
    certificateName: certificate?.fileName || null,
    certificateUrl: certificate?.documentUrl || null,
    certificateType: certificate?.mimeType || null,
  };
};

const syncTechnologies = async (tx, ownerType, ownerId, names = []) => {
  const cleanNames = [...new Set((names || []).map((name) => String(name).trim()).filter(Boolean))];

  if (ownerType === 'PROJECT') {
    await tx.projectTechnology.deleteMany({ where: { projectId: ownerId } });
  } else {
    await tx.internshipTechnology.deleteMany({ where: { internshipId: ownerId } });
  }

  for (const name of cleanNames) {
    const technology =
      (await tx.technology.findFirst({ where: { name } })) ||
      (await tx.technology.create({ data: { name, version: '' } }));

    if (ownerType === 'PROJECT') {
      await tx.projectTechnology.create({
        data: { projectId: ownerId, technologyId: technology.id },
      });
    } else {
      await tx.internshipTechnology.create({
        data: { internshipId: ownerId, technologyId: technology.id },
      });
    }
  }
};

module.exports = {
  bcrypt,
  crypto,
  prisma,
  VALID_VISIBILITIES,
  VALID_RECOMMENDATION_STATUSES,
  VALID_PROJECT_TYPES,
  VALID_ACTIVITY_TYPES,
  serviceError,
  toEnum,
  toDate,
  isPlainObject,
  normalizePreferences,
  requireBoolean,
  toRecommendationUiStatus,
  fromRecommendationUiStatus,
  getInitials,
  getStudentOrThrow,
  ensureProjectOwner,
  ensureInternshipOwner,
  ensureActivityOwner,
  projectInclude,
  internshipInclude,
  activityInclude,
  fullName,
  recommendationInclude,
  mapStudentRecommendation,
  mapProjectMedia,
  mapProject,
  mapInternshipMedia,
  mapInternship,
  mapActivity,
  syncTechnologies,
};
