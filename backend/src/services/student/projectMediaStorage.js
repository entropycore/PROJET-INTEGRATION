'use strict';

const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');

const uploadsRoot = path.resolve(__dirname, '..', '..', '..', 'uploads');
const projectUploadsDir = path.join(uploadsRoot, 'projects');

const trimFileName = (fileName) =>
  path
    .basename(String(fileName || 'fichier'))
    .replace(/[^a-zA-Z0-9._() -]+/g, '-')
    .trim()
    .slice(0, 255) || 'fichier';

const getStoredPath = (storagePath) => {
  const absolutePath = path.resolve(uploadsRoot, String(storagePath || ''));

  if (!absolutePath.startsWith(`${uploadsRoot}${path.sep}`)) {
    throw new Error('PROJECT_MEDIA_FILE_NOT_FOUND');
  }

  return absolutePath;
};

exports.storeProjectFile = async (file) => {
  await fs.mkdir(projectUploadsDir, { recursive: true });

  const extension = path.extname(file.originalname || '').toLowerCase().slice(0, 12);
  const storedFileName = `project-${crypto.randomUUID()}${extension}`;
  const storagePath = path.posix.join('projects', storedFileName);

  await fs.writeFile(getStoredPath(storagePath), file.buffer);

  return {
    fileName: trimFileName(file.originalname),
    fileSize: file.size,
    mimeType: file.mimetype,
    storagePath,
  };
};

exports.getProjectFilePath = (storagePath) => getStoredPath(storagePath);

exports.deleteProjectFile = async (storagePath) => {
  if (!storagePath) return;

  try {
    await fs.unlink(getStoredPath(storagePath));
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }
};
