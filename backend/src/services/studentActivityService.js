'use strict';

const prisma = require('../config/prisma');
const {
  deleteActivityCertificate,
  getActivityCertificateTarget,
  storeActivityCertificate,
} = require('./student/activityCertificateStorage');

const ACTIVITY_TYPES = new Set([
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

const EDITABLE_STATUSES = new Set(['DRAFT', 'CHANGES_REQUESTED', 'REJECTED']);

const activitySelect = {
  id: true,
  studentId: true,
  type: true,
  title: true,
  description: true,
  organization: true,
  startDate: true,
  endDate: true,
  duration: true,
  location: true,
  validationStatus: true,
  visibility: true,
  certificates: {
    orderBy: {
      submittedAt: 'desc',
    },
    take: 1,
    select: {
      id: true,
      documentUrl: true,
      fileName: true,
      mimeType: true,
      fileSize: true,
      storagePath: true,
      validationStatus: true,
      submittedAt: true,
    },
  },
};

const cleanText = (value) => {
  const text = String(value || '').trim();
  return text || null;
};

const parseDate = (value) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error('INVALID_ACTIVITY_DATE');
  }

  return date;
};

const formatDate = (value) => {
  if (!value) return '';
  return value.toISOString().slice(0, 10);
};

const toFrontendStatus = (status) =>
  status === 'CHANGES_REQUESTED' ? 'CORRECTION_REQUIRED' : status;

const toDatabaseStatus = (status) =>
  status === 'CORRECTION_REQUIRED' ? 'CHANGES_REQUESTED' : status;

const normalizeType = (value) => {
  const type = String(value || 'CLUB').trim().toUpperCase();

  if (!ACTIVITY_TYPES.has(type)) {
    throw new Error('INVALID_ACTIVITY_TYPE');
  }

  return type;
};

const getStudentOrThrow = async (userId) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!student) {
    throw new Error('STUDENT_PROFILE_NOT_FOUND');
  }

  return student;
};

const buildCertificateUrl = (activityId) =>
  `/api/student/activities/${activityId}/certificate/download`;

const mapActivity = (activity) => {
  const certificate = activity.certificates[0] || null;

  return {
    id: activity.id,
    title: activity.title,
    type: activity.type,
    organization: activity.organization || '',
    date: formatDate(activity.startDate),
    startDate: activity.startDate,
    endDate: activity.endDate,
    duration: activity.duration || '',
    location: activity.location || '',
    description: activity.description || '',
    visibility: activity.visibility,
    validationStatus: toFrontendStatus(activity.validationStatus),
    certificateName: certificate?.fileName || '',
    certificateUrl: certificate?.documentUrl || '',
    certificate: certificate
      ? {
          id: certificate.id,
          url: certificate.documentUrl,
          fileName: certificate.fileName || 'attestation',
          mimeType: certificate.mimeType || 'application/octet-stream',
          fileSize: certificate.fileSize || null,
          validationStatus: toFrontendStatus(certificate.validationStatus),
          submittedAt: certificate.submittedAt,
        }
      : null,
    createdAt: activity.startDate || null,
  };
};

const buildActivityData = (payload) => {
  const title = cleanText(payload.title);

  if (!title) {
    throw new Error('ACTIVITY_TITLE_REQUIRED');
  }

  return {
    type: normalizeType(payload.type),
    title,
    organization: cleanText(payload.organization),
    description: cleanText(payload.description),
    startDate: parseDate(payload.date || payload.startDate),
    endDate: parseDate(payload.endDate || payload.date || payload.startDate),
    duration: cleanText(payload.duration),
    location: cleanText(payload.location),
    visibility: payload.visibility || 'PRIVATE',
  };
};

const getStudentActivityOrThrow = async (userId, activityId) => {
  const student = await getStudentOrThrow(userId);
  const activity = await prisma.extracurricularActivity.findFirst({
    where: {
      id: activityId,
      studentId: student.id,
    },
    select: activitySelect,
  });

  if (!activity) {
    throw new Error('ACTIVITY_NOT_FOUND');
  }

  return activity;
};

const getLatestCertificate = async (activityId) =>
  prisma.certificate.findFirst({
    where: { activityId },
    orderBy: { submittedAt: 'desc' },
    select: {
      id: true,
      documentUrl: true,
      fileName: true,
      mimeType: true,
      fileSize: true,
      storagePath: true,
      validationStatus: true,
      submittedAt: true,
    },
  });

const assertEditable = (activity) => {
  if (!EDITABLE_STATUSES.has(toDatabaseStatus(activity.validationStatus))) {
    throw new Error('ACTIVITY_NOT_EDITABLE');
  }
};

const listActivities = async (userId) => {
  const student = await getStudentOrThrow(userId);
  const activities = await prisma.extracurricularActivity.findMany({
    where: { studentId: student.id },
    orderBy: [{ startDate: 'desc' }, { title: 'asc' }],
    select: activitySelect,
  });

  return activities.map(mapActivity);
};

const getActivityById = async (userId, activityId) =>
  mapActivity(await getStudentActivityOrThrow(userId, activityId));

const createActivity = async (userId, payload) => {
  const student = await getStudentOrThrow(userId);
  const created = await prisma.extracurricularActivity.create({
    data: {
      studentId: student.id,
      ...buildActivityData(payload),
      validationStatus: 'DRAFT',
    },
    select: activitySelect,
  });

  return mapActivity(created);
};

const updateActivity = async (userId, activityId, payload) => {
  const activity = await getStudentActivityOrThrow(userId, activityId);
  assertEditable(activity);

  const updated = await prisma.extracurricularActivity.update({
    where: { id: activity.id },
    data: {
      ...buildActivityData(payload),
      validationStatus: 'DRAFT',
    },
    select: activitySelect,
  });

  return mapActivity(updated);
};

const deleteActivity = async (userId, activityId) => {
  const activity = await getStudentActivityOrThrow(userId, activityId);
  assertEditable(activity);

  const certificates = await prisma.certificate.findMany({
    where: { activityId: activity.id },
    select: { storagePath: true },
  });

  await prisma.extracurricularActivity.delete({ where: { id: activity.id } });
  await Promise.all(
    certificates.map((certificate) => deleteActivityCertificate(certificate.storagePath)),
  );

  return {
    deleted: true,
    id: activity.id,
  };
};

const uploadActivityCertificate = async (userId, activityId, file) => {
  if (!file) {
    throw new Error('ACTIVITY_CERTIFICATE_UPLOAD_EMPTY');
  }

  const activity = await getStudentActivityOrThrow(userId, activityId);
  assertEditable(activity);

  const oldCertificate = await getLatestCertificate(activity.id);
  const storedFile = await storeActivityCertificate(file);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.extracurricularActivity.update({
        where: { id: activity.id },
        data: { validationStatus: 'DRAFT' },
      });

      if (oldCertificate) {
        await tx.certificate.update({
          where: { id: oldCertificate.id },
          data: {
            documentUrl: buildCertificateUrl(activity.id),
            fileName: storedFile.fileName,
            mimeType: storedFile.mimeType,
            fileSize: storedFile.fileSize,
            storagePath: storedFile.storagePath,
            validationStatus: 'DRAFT',
            submittedAt: new Date(),
          },
        });
        return;
      }

      await tx.certificate.create({
        data: {
          activityId: activity.id,
          documentUrl: buildCertificateUrl(activity.id),
          fileName: storedFile.fileName,
          mimeType: storedFile.mimeType,
          fileSize: storedFile.fileSize,
          storagePath: storedFile.storagePath,
          validationStatus: 'DRAFT',
        },
      });
    });
  } catch (err) {
    await deleteActivityCertificate(storedFile.storagePath);
    throw err;
  }

  await deleteActivityCertificate(oldCertificate?.storagePath);

  return getActivityById(userId, activity.id);
};

const submitActivityValidation = async (userId, activityId) => {
  const activity = await getStudentActivityOrThrow(userId, activityId);
  const status = toDatabaseStatus(activity.validationStatus);

  if (!['DRAFT', 'CHANGES_REQUESTED'].includes(status)) {
    throw new Error('ACTIVITY_NOT_SUBMITTABLE');
  }

  const certificate = activity.certificates[0] || (await getLatestCertificate(activity.id));
  if (!certificate) {
    throw new Error('ACTIVITY_CERTIFICATE_REQUIRED');
  }

  await prisma.$transaction([
    prisma.extracurricularActivity.update({
      where: { id: activity.id },
      data: { validationStatus: 'PENDING' },
    }),
    prisma.certificate.update({
      where: { id: certificate.id },
      data: {
        validationStatus: 'PENDING',
        submittedAt: new Date(),
      },
    }),
  ]);

  return getActivityById(userId, activity.id);
};

const getActivityCertificateFile = async (userId, activityId) => {
  await getStudentActivityOrThrow(userId, activityId);
  const certificate = await getLatestCertificate(activityId);

  if (!certificate?.storagePath) {
    throw new Error('ACTIVITY_CERTIFICATE_FILE_NOT_FOUND');
  }

  return {
    target: await getActivityCertificateTarget(certificate.storagePath, {
      originalName: certificate.fileName || 'attestation',
      mimeType: certificate.mimeType || 'application/octet-stream',
      contentDisposition: 'attachment',
    }),
    downloadName: certificate.fileName || 'attestation',
    mimeType: certificate.mimeType || 'application/octet-stream',
  };
};

module.exports = {
  createActivity,
  deleteActivity,
  getActivityById,
  getActivityCertificateFile,
  listActivities,
  submitActivityValidation,
  updateActivity,
  uploadActivityCertificate,
};
