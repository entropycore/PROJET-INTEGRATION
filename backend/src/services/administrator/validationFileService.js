'use strict';

const prisma = require('../../config/prisma');
const { getActivityCertificateTarget } = require('../student/activityCertificateStorage');
const { getProjectFileTarget } = require('../student/projectMediaStorage');
const { getStageFileTarget } = require('../student/stageMediaStorage');
const { ensureValidValidationType, normalizeValidationType } = require('./validationData');

const isInlineProjectMedia = (mediaType) =>
  ['IMAGE', 'SCREENSHOT'].includes(String(mediaType || '').toUpperCase());

const getContentDisposition = (action, canInline) =>
  action === 'content' && canInline ? 'inline' : 'attachment';

const getProjectValidationFile = async (projectId, fileId, action) => {
  const media = await prisma.projectMedia.findFirst({
    where: {
      id: fileId,
      projectId,
      project: {
        validationStatus: {
          in: ['PENDING', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED'],
        },
      },
    },
    select: {
      id: true,
      mediaType: true,
      description: true,
      fileName: true,
      mimeType: true,
      storagePath: true,
    },
  });

  if (!media?.storagePath) {
    throw new Error('ADMIN_VALIDATION_FILE_NOT_FOUND');
  }

  const downloadName = media.fileName || media.description || 'fichier-projet';

  return {
    target: await getProjectFileTarget(media.storagePath, {
      originalName: downloadName,
      mimeType: media.mimeType || 'application/octet-stream',
      contentDisposition: getContentDisposition(action, isInlineProjectMedia(media.mediaType)),
    }),
    downloadName,
    mimeType: media.mimeType || 'application/octet-stream',
  };
};

const getInternshipReportFile = async (internshipId) => {
  const internship = await prisma.internship.findUnique({
    where: { id: internshipId },
    select: {
      reportFileName: true,
      reportMimeType: true,
      reportStoragePath: true,
    },
  });

  if (!internship?.reportStoragePath) {
    throw new Error('ADMIN_VALIDATION_FILE_NOT_FOUND');
  }

  const downloadName = internship.reportFileName || 'rapport-stage.pdf';

  return {
    target: await getStageFileTarget(internship.reportStoragePath, {
      originalName: downloadName,
      mimeType: internship.reportMimeType || 'application/pdf',
      contentDisposition: 'attachment',
    }),
    downloadName,
    mimeType: internship.reportMimeType || 'application/pdf',
  };
};

const getInternshipMediaFile = async (internshipId, fileId, action) => {
  const media = await prisma.internshipMedia.findFirst({
    where: {
      id: fileId,
      internshipId,
    },
    select: {
      id: true,
      mediaType: true,
      description: true,
      fileName: true,
      mimeType: true,
      storagePath: true,
    },
  });

  if (!media?.storagePath) {
    throw new Error('ADMIN_VALIDATION_FILE_NOT_FOUND');
  }

  const downloadName = media.fileName || media.description || 'fichier-stage';

  return {
    target: await getStageFileTarget(media.storagePath, {
      originalName: downloadName,
      mimeType: media.mimeType || 'application/octet-stream',
      contentDisposition: getContentDisposition(
        action,
        String(media.mediaType || '').toUpperCase() === 'IMAGE',
      ),
    }),
    downloadName,
    mimeType: media.mimeType || 'application/octet-stream',
  };
};

const getCertificateValidationFile = async (certificateId) => {
  const certificate = await prisma.certificate.findUnique({
    where: { id: certificateId },
    select: {
      fileName: true,
      mimeType: true,
      storagePath: true,
    },
  });

  if (!certificate?.storagePath) {
    throw new Error('ADMIN_VALIDATION_FILE_NOT_FOUND');
  }

  const downloadName = certificate.fileName || 'attestation';

  return {
    target: await getActivityCertificateTarget(certificate.storagePath, {
      originalName: downloadName,
      mimeType: certificate.mimeType || 'application/octet-stream',
      contentDisposition: 'attachment',
    }),
    downloadName,
    mimeType: certificate.mimeType || 'application/octet-stream',
  };
};

const getAdminValidationFile = (itemType, itemId, fileId, action = 'download') => {
  const type = normalizeValidationType(itemType);
  ensureValidValidationType(type);

  if (type === 'PROJECT') {
    return getProjectValidationFile(itemId, fileId, action);
  }

  if (type === 'INTERNSHIP') {
    return fileId === 'report'
      ? getInternshipReportFile(itemId)
      : getInternshipMediaFile(itemId, fileId, action);
  }

  if (type === 'CERTIFICATE_VALIDATION') {
    return getCertificateValidationFile(itemId);
  }

  throw new Error('ADMIN_VALIDATION_FILE_NOT_FOUND');
};

module.exports = {
  getAdminValidationFile,
};
