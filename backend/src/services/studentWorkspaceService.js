'use strict';

const crypto = require('crypto');

const prisma = require('../config/prisma');

const VALID_VISIBILITIES = new Set(['PUBLIC', 'PRIVATE', 'TEACHERS', 'SHARED_LINK']);
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

exports.listValidators = async () => {
  const professors = await prisma.professor.findMany({
    include: { user: true },
    orderBy: { user: { lastName: 'asc' } },
  });

  return professors.map((professor) => ({
    id: professor.id,
    fullName: fullName(professor.user),
    email: professor.user.email,
    department: professor.department,
    specialty: professor.specialty,
    grade: professor.grade,
  }));
};

exports.listProjects = async (userId) => {
  const student = await getStudentOrThrow(userId);
  const projects = await prisma.project.findMany({
    where: { studentId: student.id },
    include: projectInclude,
    orderBy: { createdAt: 'desc' },
  });
  return projects.map(mapProject);
};

exports.getProject = async (userId, projectId) => {
  await ensureProjectOwner(userId, projectId);
  const project = await prisma.project.findUnique({ where: { id: projectId }, include: projectInclude });
  return mapProject(project);
};

exports.createProject = async (userId, payload) => {
  const student = await getStudentOrThrow(userId);
  const project = await prisma.$transaction(async (tx) => {
    const created = await tx.project.create({
      data: {
        studentId: student.id,
        title: payload.title,
        description: payload.description || '',
        type: toEnum(payload.type, 'PERSONAL', VALID_PROJECT_TYPES),
        teamRole: payload.role || payload.teamRole || null,
        teamSize: payload.teamSize || null,
        validatorProfessorId: payload.validatorId || payload.validatorProfessorId || null,
        githubUrl: payload.githubUrl || null,
        youtubeUrl: payload.youtubeUrl || payload.demoUrl || null,
        result: payload.result || payload.documentationUrl || null,
        visibility: toEnum(payload.visibility, 'PRIVATE', VALID_VISIBILITIES),
        validationStatus: 'DRAFT',
      },
    });

    await syncTechnologies(tx, 'PROJECT', created.id, payload.technologies);
    return created;
  });

  return exports.getProject(userId, project.id);
};

exports.updateProject = async (userId, projectId, payload) => {
  await ensureProjectOwner(userId, projectId);

  await prisma.$transaction(async (tx) => {
    await tx.project.update({
      where: { id: projectId },
      data: {
        title: payload.title,
        description: payload.description,
        type: payload.type ? toEnum(payload.type, 'PERSONAL', VALID_PROJECT_TYPES) : undefined,
        teamRole: payload.role || payload.teamRole || undefined,
        teamSize: payload.teamSize || undefined,
        validatorProfessorId: payload.validatorId || payload.validatorProfessorId || undefined,
        githubUrl: payload.githubUrl ?? undefined,
        youtubeUrl: payload.youtubeUrl || payload.demoUrl || undefined,
        result: payload.result || payload.documentationUrl || undefined,
        visibility: payload.visibility
          ? toEnum(payload.visibility, 'PRIVATE', VALID_VISIBILITIES)
          : undefined,
      },
    });

    if (Array.isArray(payload.technologies)) {
      await syncTechnologies(tx, 'PROJECT', projectId, payload.technologies);
    }
  });

  return exports.getProject(userId, projectId);
};

exports.submitProject = async (userId, projectId) => {
  await ensureProjectOwner(userId, projectId);
  await prisma.project.update({
    where: { id: projectId },
    data: { validationStatus: 'PENDING', submittedAt: new Date() },
  });
  return exports.getProject(userId, projectId);
};

exports.deleteProject = async (userId, projectId) => {
  await ensureProjectOwner(userId, projectId);
  await prisma.project.delete({ where: { id: projectId } });
  return { deleted: true, id: projectId };
};

exports.addProjectMediaRecord = async (userId, projectId, uploadedFile, mediaType) => {
  await ensureProjectOwner(userId, projectId);
  const media = await prisma.projectMedia.create({
    data: {
      projectId,
      mediaType,
      mediaUrl: uploadedFile.downloadUrl,
      description: uploadedFile.originalName,
      fileName: uploadedFile.originalName,
      mimeType: uploadedFile.mimeType,
      fileSize: uploadedFile.sizeBytes,
      storagePath: uploadedFile.objectKey,
    },
  });
  return mapProjectMedia(media);
};

exports.deleteProjectMedia = async (userId, projectId, mediaId) => {
  await ensureProjectOwner(userId, projectId);
  await prisma.projectMedia.deleteMany({ where: { id: mediaId, projectId } });
  return { deleted: true, id: mediaId };
};

exports.listStages = async (userId) => {
  const student = await getStudentOrThrow(userId);
  const internships = await prisma.internship.findMany({
    where: { studentId: student.id },
    include: internshipInclude,
    orderBy: [{ startDate: 'desc' }, { endDate: 'desc' }],
  });
  return internships.map(mapInternship);
};

exports.getStage = async (userId, stageId) => {
  await ensureInternshipOwner(userId, stageId);
  const internship = await prisma.internship.findUnique({
    where: { id: stageId },
    include: internshipInclude,
  });
  return mapInternship(internship);
};

exports.createStage = async (userId, payload) => {
  const student = await getStudentOrThrow(userId);
  const internship = await prisma.$transaction(async (tx) => {
    const created = await tx.internship.create({
      data: {
        studentId: student.id,
        hostOrganization: payload.company || payload.hostOrganization || payload.title,
        duration: payload.duration || null,
        startDate: toDate(payload.startDate),
        endDate: toDate(payload.endDate),
        missions: Array.isArray(payload.missions)
          ? payload.missions.join('\n')
          : payload.missions || payload.description || null,
        supervisorProfessorId: payload.supervisor?.id || payload.supervisorProfessorId || null,
        visibility: toEnum(payload.visibility, 'PRIVATE', VALID_VISIBILITIES),
        validationStatus: 'DRAFT',
      },
    });

    await syncTechnologies(tx, 'INTERNSHIP', created.id, payload.technologies);
    return created;
  });

  return exports.getStage(userId, internship.id);
};

exports.updateStage = async (userId, stageId, payload) => {
  await ensureInternshipOwner(userId, stageId);
  await prisma.$transaction(async (tx) => {
    await tx.internship.update({
      where: { id: stageId },
      data: {
        hostOrganization: payload.company || payload.hostOrganization || undefined,
        duration: payload.duration ?? undefined,
        startDate: payload.startDate ? toDate(payload.startDate) : undefined,
        endDate: payload.endDate ? toDate(payload.endDate) : undefined,
        missions: Array.isArray(payload.missions)
          ? payload.missions.join('\n')
          : payload.missions || payload.description || undefined,
        supervisorProfessorId: payload.supervisor?.id || payload.supervisorProfessorId || undefined,
        visibility: payload.visibility
          ? toEnum(payload.visibility, 'PRIVATE', VALID_VISIBILITIES)
          : undefined,
      },
    });

    if (Array.isArray(payload.technologies)) {
      await syncTechnologies(tx, 'INTERNSHIP', stageId, payload.technologies);
    }
  });

  return exports.getStage(userId, stageId);
};

exports.submitStage = async (userId, stageId) => {
  await ensureInternshipOwner(userId, stageId);
  await prisma.internship.update({
    where: { id: stageId },
    data: { validationStatus: 'PENDING' },
  });
  return exports.getStage(userId, stageId);
};

exports.updateStageVisibility = async (userId, stageId, visibility) => {
  await ensureInternshipOwner(userId, stageId);
  await prisma.internship.update({
    where: { id: stageId },
    data: { visibility: toEnum(visibility, 'PRIVATE', VALID_VISIBILITIES) },
  });
  return exports.getStage(userId, stageId);
};

exports.deleteStage = async (userId, stageId) => {
  await ensureInternshipOwner(userId, stageId);
  await prisma.internship.delete({ where: { id: stageId } });
  return { deleted: true, id: stageId };
};

exports.attachStageReport = async (userId, stageId, uploadedFile) => {
  await ensureInternshipOwner(userId, stageId);
  await prisma.internship.update({
    where: { id: stageId },
    data: {
      reportUrl: uploadedFile.downloadUrl,
      reportFileName: uploadedFile.originalName,
      reportMimeType: uploadedFile.mimeType,
      reportFileSize: uploadedFile.sizeBytes,
      reportStoragePath: uploadedFile.objectKey,
    },
  });
  return exports.getStage(userId, stageId);
};

exports.addStageImageRecord = async (userId, stageId, uploadedFile) => {
  await ensureInternshipOwner(userId, stageId);
  const media = await prisma.internshipMedia.create({
    data: {
      internshipId: stageId,
      mediaType: 'IMAGE',
      mediaUrl: uploadedFile.downloadUrl,
      description: uploadedFile.originalName,
      fileName: uploadedFile.originalName,
      mimeType: uploadedFile.mimeType,
      fileSize: uploadedFile.sizeBytes,
      storagePath: uploadedFile.objectKey,
    },
  });
  return mapInternshipMedia(media);
};

exports.deleteStageImage = async (userId, stageId, mediaId) => {
  await ensureInternshipOwner(userId, stageId);
  await prisma.internshipMedia.deleteMany({ where: { id: mediaId, internshipId: stageId } });
  return { deleted: true, id: mediaId };
};

exports.getStageImage = async (userId, stageId, mediaId) => {
  await ensureInternshipOwner(userId, stageId);
  const media = await prisma.internshipMedia.findFirst({
    where: { id: mediaId, internshipId: stageId },
  });
  if (!media) throw serviceError('STAGE_MEDIA_NOT_FOUND', 404);
  return mapInternshipMedia(media);
};

exports.listActivities = async (userId) => {
  const student = await getStudentOrThrow(userId);
  const activities = await prisma.extracurricularActivity.findMany({
    where: { studentId: student.id },
    include: activityInclude,
    orderBy: [{ startDate: 'desc' }],
  });
  return activities.map(mapActivity);
};

exports.getActivity = async (userId, activityId) => {
  await ensureActivityOwner(userId, activityId);
  const activity = await prisma.extracurricularActivity.findUnique({
    where: { id: activityId },
    include: activityInclude,
  });
  return mapActivity(activity);
};

exports.createActivity = async (userId, payload) => {
  const student = await getStudentOrThrow(userId);
  const activity = await prisma.extracurricularActivity.create({
    data: {
      studentId: student.id,
      title: payload.title,
      type: toEnum(payload.type, 'OTHER', VALID_ACTIVITY_TYPES),
      organization: payload.organization || null,
      startDate: toDate(payload.date || payload.startDate),
      endDate: toDate(payload.endDate || payload.date),
      duration: payload.duration || null,
      location: payload.location || null,
      description: payload.description || null,
      visibility: toEnum(payload.visibility, 'PRIVATE', VALID_VISIBILITIES),
      validationStatus: 'DRAFT',
    },
  });
  return exports.getActivity(userId, activity.id);
};

exports.updateActivity = async (userId, activityId, payload) => {
  await ensureActivityOwner(userId, activityId);
  await prisma.extracurricularActivity.update({
    where: { id: activityId },
    data: {
      title: payload.title,
      type: payload.type ? toEnum(payload.type, 'OTHER', VALID_ACTIVITY_TYPES) : undefined,
      organization: payload.organization ?? undefined,
      startDate: payload.date || payload.startDate ? toDate(payload.date || payload.startDate) : undefined,
      endDate: payload.endDate || payload.date ? toDate(payload.endDate || payload.date) : undefined,
      duration: payload.duration ?? undefined,
      location: payload.location ?? undefined,
      description: payload.description ?? undefined,
      visibility: payload.visibility
        ? toEnum(payload.visibility, 'PRIVATE', VALID_VISIBILITIES)
        : undefined,
    },
  });
  return exports.getActivity(userId, activityId);
};

exports.submitActivity = async (userId, activityId) => {
  await ensureActivityOwner(userId, activityId);
  await prisma.extracurricularActivity.update({
    where: { id: activityId },
    data: { validationStatus: 'PENDING' },
  });
  return exports.getActivity(userId, activityId);
};

exports.deleteActivity = async (userId, activityId) => {
  await ensureActivityOwner(userId, activityId);
  await prisma.extracurricularActivity.delete({ where: { id: activityId } });
  return { deleted: true, id: activityId };
};

exports.attachActivityCertificate = async (userId, activityId, uploadedFile) => {
  await ensureActivityOwner(userId, activityId);
  await prisma.certificate.create({
    data: {
      activityId,
      documentUrl: uploadedFile.downloadUrl,
      fileName: uploadedFile.originalName,
      mimeType: uploadedFile.mimeType,
      fileSize: uploadedFile.sizeBytes,
      storagePath: uploadedFile.objectKey,
      validationStatus: 'PENDING',
    },
  });
  return exports.getActivity(userId, activityId);
};

exports.getActivityCertificate = async (userId, activityId) => {
  await ensureActivityOwner(userId, activityId);
  const certificate = await prisma.certificate.findFirst({
    where: { activityId },
    orderBy: { submittedAt: 'desc' },
  });
  if (!certificate) throw serviceError('CERTIFICATE_NOT_FOUND', 404);
  return certificate;
};

exports.getPortfolioPreview = async (userId) => {
  const student = await getStudentOrThrow(userId);
  const [portfolio, projects, internships, activities, skills] = await Promise.all([
    prisma.portfolio.findUnique({ where: { studentId: student.id } }),
    exports.listProjects(userId),
    exports.listStages(userId),
    exports.listActivities(userId),
    prisma.studentSkill.findMany({
      where: { studentId: student.id },
      include: { skill: true },
      orderBy: { updatedAt: 'desc' },
    }),
  ]);

  return {
    portfolio,
    student,
    projects,
    internships,
    activities,
    skills: skills.map((item) => ({
      id: item.id,
      name: item.skill.name,
      type: item.skill.type,
      masteryLevel: item.masteryLevel,
    })),
  };
};

exports.generatePortfolio = async (userId, payload = {}) => {
  const student = await getStudentOrThrow(userId);
  const slugBase = `${student.user.firstName}-${student.user.lastName}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const publicSlug = payload.publicSlug || `${slugBase || 'portfolio'}-${student.id.slice(0, 8)}`;

  await prisma.portfolio.upsert({
    where: { studentId: student.id },
    update: {
      title: payload.title || `${fullName(student.user)} - Portfolio`,
      description: payload.description || null,
      visibility: toEnum(payload.visibility, 'PRIVATE', VALID_VISIBILITIES),
      status: payload.status || 'ACTIVE',
      targetDomain: payload.targetDomain || null,
      theme: payload.theme || 'modern-academic',
      includedSections: payload.includedSections || [],
      includedItems: payload.includedItems || {},
    },
    create: {
      studentId: student.id,
      title: payload.title || `${fullName(student.user)} - Portfolio`,
      publicSlug,
      description: payload.description || null,
      visibility: toEnum(payload.visibility, 'PRIVATE', VALID_VISIBILITIES),
      status: payload.status || 'ACTIVE',
      targetDomain: payload.targetDomain || null,
      theme: payload.theme || 'modern-academic',
      includedSections: payload.includedSections || [],
      includedItems: payload.includedItems || {},
    },
  });

  return exports.getPortfolioPreview(userId);
};

exports.getPublicPortfolio = async (slug) => {
  const portfolio = await prisma.portfolio.findUnique({
    where: { publicSlug: slug },
    include: { student: { include: { user: true } } },
  });
  if (!portfolio || portfolio.visibility === 'PRIVATE') {
    throw serviceError('PORTFOLIO_NOT_FOUND', 404);
  }
  return exports.getPortfolioPreview(portfolio.student.userId);
};

exports.getStudentProfile = async (userId) => getStudentOrThrow(userId);

exports.updateStudentProfile = async (userId, payload) => {
  const student = await getStudentOrThrow(userId);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        phone: payload.phone,
        profilePicture: payload.profilePicture,
      },
    }),
    prisma.student.update({
      where: { id: student.id },
      data: {
        major: payload.major,
        level: payload.level,
        birthDate: payload.birthDate ? toDate(payload.birthDate) : undefined,
        address: payload.address,
        city: payload.city,
        bio: payload.bio,
        careerObjective: payload.careerObjective,
        linkedinUrl: payload.linkedinUrl,
      },
    }),
  ]);
  return getStudentOrThrow(userId);
};

exports.listAcademicPaths = async (userId) => {
  const student = await getStudentOrThrow(userId);
  return prisma.academicPath.findMany({
    where: { studentId: student.id },
    orderBy: [{ endDate: 'desc' }, { startDate: 'desc' }],
  });
};

exports.createAcademicPath = async (userId, payload) => {
  const student = await getStudentOrThrow(userId);
  return prisma.academicPath.create({
    data: {
      studentId: student.id,
      institution: payload.institution,
      degree: payload.degree,
      major: payload.major || null,
      startDate: toDate(payload.startDate),
      endDate: toDate(payload.endDate),
      honor: payload.honor || null,
    },
  });
};

exports.updateAcademicPath = async (userId, id, payload) => {
  const student = await getStudentOrThrow(userId);
  await prisma.academicPath.updateMany({
    where: { id, studentId: student.id },
    data: {
      institution: payload.institution,
      degree: payload.degree,
      major: payload.major,
      startDate: payload.startDate ? toDate(payload.startDate) : undefined,
      endDate: payload.endDate ? toDate(payload.endDate) : undefined,
      honor: payload.honor,
    },
  });
  return prisma.academicPath.findFirst({ where: { id, studentId: student.id } });
};

exports.deleteAcademicPath = async (userId, id) => {
  const student = await getStudentOrThrow(userId);
  await prisma.academicPath.deleteMany({ where: { id, studentId: student.id } });
  return { deleted: true, id };
};

exports.listSkillsCatalog = async (search = '') =>
  prisma.skill.findMany({
    where: search
      ? { name: { contains: search, mode: 'insensitive' } }
      : undefined,
    include: { domain: true },
    orderBy: { name: 'asc' },
    take: 50,
  });

exports.listStudentSkills = async (userId, type = null) => {
  const student = await getStudentOrThrow(userId);
  const skills = await prisma.studentSkill.findMany({
    where: {
      studentId: student.id,
      ...(type ? { skill: { type } } : {}),
    },
    include: { skill: { include: { domain: true } } },
    orderBy: { updatedAt: 'desc' },
  });
  return skills.map((item) => ({
    id: item.id,
    masteryLevel: item.masteryLevel,
    skillSource: item.skillSource,
    skill: item.skill,
    name: item.skill.name,
    type: item.skill.type,
  }));
};

exports.addStudentSkill = async (userId, payload, forcedType = null) => {
  const student = await getStudentOrThrow(userId);
  const name = String(payload.name || payload.skillName || '').trim();
  if (!name) throw serviceError('SKILL_NAME_REQUIRED', 400);

  const skill = await prisma.skill.upsert({
    where: { name },
    update: {},
    create: {
      name,
      type: forcedType || toEnum(payload.type, 'TECHNICAL', new Set(['TECHNICAL', 'SOFT_SKILL'])),
      description: payload.description || null,
    },
  });

  return prisma.studentSkill.upsert({
    where: { studentId_skillId: { studentId: student.id, skillId: skill.id } },
    update: {
      masteryLevel: payload.masteryLevel || payload.level || null,
      skillSource: payload.skillSource || null,
    },
    create: {
      studentId: student.id,
      skillId: skill.id,
      masteryLevel: payload.masteryLevel || payload.level || null,
      skillSource: payload.skillSource || null,
    },
    include: { skill: true },
  });
};

exports.deleteStudentSkill = async (userId, id) => {
  const student = await getStudentOrThrow(userId);
  await prisma.studentSkill.deleteMany({ where: { id, studentId: student.id } });
  return { deleted: true, id };
};

exports.getSkillStats = async (userId) => {
  const skills = await exports.listStudentSkills(userId);
  return {
    total: skills.length,
    technical: skills.filter((item) => item.type === 'TECHNICAL').length,
    soft: skills.filter((item) => item.type === 'SOFT_SKILL').length,
  };
};

exports.getCareerGoal = async (userId) => {
  const student = await getStudentOrThrow(userId);
  return { careerObjective: student.careerObjective };
};

exports.updateCareerGoal = async (userId, payload) => {
  const student = await getStudentOrThrow(userId);
  return prisma.student.update({
    where: { id: student.id },
    data: { careerObjective: payload.careerObjective || payload.goal || null },
  });
};

exports.listBadges = async () => prisma.badge.findMany({ orderBy: { createdAt: 'desc' } });

exports.getDashboardExtras = async (userId) => {
  const profile = await getStudentOrThrow(userId);
  const [badges, timeline] = await Promise.all([
    exports.listBadges(),
    prisma.academicTimeline.findMany({
      where: { studentId: profile.id },
      orderBy: { startDate: 'desc' },
      take: 10,
    }),
  ]);

  return {
    credibilityScore: 0,
    profileCompletion: profile.bio && profile.linkedinUrl ? 80 : 40,
    badges,
    timeline,
  };
};

exports.createMediaPlaceholderId = () => crypto.randomUUID();
