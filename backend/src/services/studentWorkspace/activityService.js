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
