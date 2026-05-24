'use strict';

const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');

const uploadsRoot = path.resolve(__dirname, '..', '..', '..', 'uploads');
const stageUploadsDir = path.join(uploadsRoot, 'stages');

const trimFileName = (fileName) =>
  path
    .basename(String(fileName || 'fichier'))
    .replace(/[^a-zA-Z0-9._() -]+/g, '-')
    .trim()
    .slice(0, 255) || 'fichier';

const getStoredPath = (storagePath) => {
  const absolutePath = path.resolve(uploadsRoot, String(storagePath || ''));

  if (!absolutePath.startsWith(`${uploadsRoot}${path.sep}`)) {
    throw new Error('STAGE_FILE_NOT_FOUND');
  }

  return absolutePath;
};

const storeStageFile = async (file, prefix) => {
  await fs.mkdir(stageUploadsDir, { recursive: true });

  const extension = path.extname(file.originalname || '').toLowerCase().slice(0, 12);
  const storedFileName = `${prefix}-${crypto.randomUUID()}${extension}`;
  const storagePath = path.posix.join('stages', storedFileName);

  await fs.writeFile(getStoredPath(storagePath), file.buffer);

  return {
    fileName: trimFileName(file.originalname),
    fileSize: file.size,
    mimeType: file.mimetype,
    storagePath,
  };
};

const getStageFilePath = (storagePath) => getStoredPath(storagePath);

const deleteStageFile = async (storagePath) => {
  if (!storagePath) return;

  try {
    await fs.unlink(getStoredPath(storagePath));
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }
};

module.exports = {
  deleteStageFile,
  getStageFilePath,
  storeStageFile,
};
