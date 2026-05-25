'use strict';

const {
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
  normalizePreferences,
  requireBoolean,
  fromRecommendationUiStatus,
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
  mapProject,
  mapInternship,
  mapInternshipMedia,
  mapActivity,
  syncTechnologies,
} = require('./shared');

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
