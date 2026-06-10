'use strict';

const crypto = require('crypto');
const prisma = require('../config/prisma');
const {
  deleteProjectFile,
  getProjectFileTarget,
  storeProjectFile,
} = require('./student/projectMediaStorage');

const projectMediaFileSelect = {
  id: true,
  projectId: true,
  mediaType: true,
  mediaUrl: true,
  description: true,
  fileName: true,
  mimeType: true,
  storagePath: true,
};

const getStudentProjectOrThrow = async (userId, projectId) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      student: { userId },
    },
    select: { id: true },
  });

  if (!project) {
    throw new Error('PROJECT_NOT_FOUND');
  }

  return project;
};

const getReadableProjectOrThrow = async (user, projectId) => {
  const role = String(user.role || '').toUpperCase();

  if (role === 'STUDENT') {
    return getStudentProjectOrThrow(user.userId, projectId);
  }

  let project = null;

  if (role === 'ADMINISTRATOR') {
    project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });
  }

  if (role === 'PROFESSOR') {
    project = await prisma.project.findFirst({
      where: {
        id: projectId,
        validatorProfessor: { userId: user.userId },
      },
      select: { id: true },
    });
  }

  if (!project) {
    throw new Error('PROJECT_NOT_FOUND');
  }

  return project;
};

const getProjectMediaOrThrow = async (projectId, mediaId) => {
  const media = await prisma.projectMedia.findFirst({
    where: {
      id: mediaId,
      projectId,
    },
    select: projectMediaFileSelect,
  });

  if (!media) {
    throw new Error('PROJECT_MEDIA_NOT_FOUND');
  }

  return media;
};

const buildMediaUrl = (projectId, mediaId, action) =>
  `/api/projects/${projectId}/media/${mediaId}/${action}`;

const storeFiles = async (projectId, files, mediaType, action) => {
  const records = [];

  try {
    for (const file of files) {
      const id = crypto.randomUUID();
      const storedFile = await storeProjectFile(file);

      records.push({
        id,
        projectId,
        mediaType,
        mediaUrl: buildMediaUrl(projectId, id, action),
        description: storedFile.fileName,
        ...storedFile,
      });
    }
  } catch (err) {
    await Promise.all(records.map((record) => deleteProjectFile(record.storagePath)));
    throw err;
  }

  return records;
};

exports.uploadProjectMedia = async (userId, projectId, files = {}) => {
  const screenshots = files.screenshots || [];
  const attachments = files.attachments || [];

  if (!screenshots.length && !attachments.length) {
    throw new Error('PROJECT_MEDIA_UPLOAD_EMPTY');
  }

  await getStudentProjectOrThrow(userId, projectId);

  let records = [];

  try {
    records.push(...(await storeFiles(projectId, screenshots, 'SCREENSHOT', 'content')));
    records.push(...(await storeFiles(projectId, attachments, 'ATTACHMENT', 'download')));

    await prisma.projectMedia.createMany({ data: records });
  } catch (err) {
    await Promise.all(records.map((record) => deleteProjectFile(record.storagePath)));
    throw err;
  }

  return records;
};

exports.getProjectMediaFile = async (
  user,
  projectId,
  mediaId,
  contentDisposition = 'attachment'
) => {
  await getReadableProjectOrThrow(user, projectId);
  const media = await getProjectMediaOrThrow(projectId, mediaId);

  if (!media.storagePath) {
    throw new Error('PROJECT_MEDIA_FILE_NOT_FOUND');
  }

  return {
    target: await getProjectFileTarget(media.storagePath, {
      originalName: media.fileName || media.description || 'fichier',
      mimeType: media.mimeType || 'application/octet-stream',
      contentDisposition,
    }),
    downloadName: media.fileName || media.description || 'fichier',
    mimeType: media.mimeType || 'application/octet-stream',
  };
};

exports.deleteProjectMedia = async (userId, projectId, mediaId) => {
  await getStudentProjectOrThrow(userId, projectId);
  const media = await getProjectMediaOrThrow(projectId, mediaId);

  await prisma.projectMedia.delete({ where: { id: media.id } });
  await deleteProjectFile(media.storagePath);

  return {
    deleted: true,
    id: media.id,
  };
};
