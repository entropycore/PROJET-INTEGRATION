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
