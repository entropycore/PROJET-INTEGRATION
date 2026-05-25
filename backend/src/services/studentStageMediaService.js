'use strict';

const crypto = require('crypto');
const prisma = require('../config/prisma');
const {
  deleteStageFile,
  getStageFilePath,
  storeStageFile,
} = require('./student/stageMediaStorage');

const getStudentStageOrThrow = async (userId, internshipId) => {
  const internship = await prisma.internship.findFirst({
    where: {
      id: internshipId,
      student: { userId },
    },
    select: {
      id: true,
      reportFileName: true,
      reportMimeType: true,
      reportStoragePath: true,
    },
  });

  if (!internship) {
    throw new Error('STAGE_NOT_FOUND');
  }

  return internship;
};

const getStageMediaOrThrow = async (internshipId, mediaId) => {
  const media = await prisma.internshipMedia.findFirst({
    where: {
      id: mediaId,
      internshipId,
    },
    select: {
      id: true,
      internshipId: true,
      mediaType: true,
      mediaUrl: true,
      fileName: true,
      mimeType: true,
      storagePath: true,
    },
  });

  if (!media) {
    throw new Error('STAGE_IMAGE_NOT_FOUND');
  }

  return media;
};

const buildReportUrl = (internshipId) =>
  `/api/student/stages/${internshipId}/report/download`;

const buildImageUrl = (internshipId, mediaId) =>
  `/api/student/stages/${internshipId}/images/${mediaId}/content`;

const uploadStageReport = async (userId, internshipId, file) => {
  if (!file) {
    throw new Error('STAGE_REPORT_UPLOAD_EMPTY');
  }

  const internship = await getStudentStageOrThrow(userId, internshipId);
  const storedFile = await storeStageFile(file, 'stage-report');

  try {
    await prisma.internship.update({
      where: { id: internshipId },
      data: {
        reportUrl: buildReportUrl(internshipId),
        reportFileName: storedFile.fileName,
        reportMimeType: storedFile.mimeType,
        reportFileSize: storedFile.fileSize,
        reportStoragePath: storedFile.storagePath,
      },
    });
  } catch (err) {
    await deleteStageFile(storedFile.storagePath);
    throw err;
  }

  await deleteStageFile(internship.reportStoragePath);

  return {
    reportUrl: buildReportUrl(internshipId),
    fileName: storedFile.fileName,
    mimeType: storedFile.mimeType,
    fileSize: storedFile.fileSize,
  };
};

const getStageReportFile = async (userId, internshipId) => {
  const internship = await getStudentStageOrThrow(userId, internshipId);

  if (!internship.reportStoragePath) {
    throw new Error('STAGE_REPORT_NOT_FOUND');
  }

  return {
    absolutePath: getStageFilePath(internship.reportStoragePath),
    downloadName: internship.reportFileName || 'rapport-stage.pdf',
    mimeType: internship.reportMimeType || 'application/pdf',
  };
};

const uploadStageImages = async (userId, internshipId, files = []) => {
  if (!files.length) {
    throw new Error('STAGE_IMAGE_UPLOAD_EMPTY');
  }

  await getStudentStageOrThrow(userId, internshipId);
  const records = [];

  try {
    for (const file of files) {
      const id = crypto.randomUUID();
      const storedFile = await storeStageFile(file, 'stage-image');

      records.push({
        id,
        internshipId,
        mediaType: 'IMAGE',
        mediaUrl: buildImageUrl(internshipId, id),
        description: storedFile.fileName,
        ...storedFile,
      });
    }

    await prisma.internshipMedia.createMany({ data: records });
  } catch (err) {
    await Promise.all(records.map((record) => deleteStageFile(record.storagePath)));
    throw err;
  }

  return records.map((record) => ({
    id: record.id,
    title: record.fileName,
    imageUrl: record.mediaUrl,
    mimeType: record.mimeType,
    fileSize: record.fileSize,
  }));
};

const getStageImageFile = async (userId, internshipId, mediaId) => {
  await getStudentStageOrThrow(userId, internshipId);
  const media = await getStageMediaOrThrow(internshipId, mediaId);

  if (!media.storagePath) {
    throw new Error('STAGE_FILE_NOT_FOUND');
  }

  return {
    absolutePath: getStageFilePath(media.storagePath),
    downloadName: media.fileName || 'image-stage',
    mimeType: media.mimeType || 'application/octet-stream',
  };
};

const deleteStageImage = async (userId, internshipId, mediaId) => {
  await getStudentStageOrThrow(userId, internshipId);
  const media = await getStageMediaOrThrow(internshipId, mediaId);

  await prisma.internshipMedia.delete({ where: { id: media.id } });
  await deleteStageFile(media.storagePath);

  return {
    deleted: true,
    id: media.id,
  };
};

module.exports = {
  deleteStageImage,
  getStageImageFile,
  getStageReportFile,
  uploadStageImages,
  uploadStageReport,
};
