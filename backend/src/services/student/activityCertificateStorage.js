'use strict';

const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');

const uploadsRoot = path.resolve(__dirname, '..', '..', '..', 'uploads');
const activityUploadsDir = path.join(uploadsRoot, 'activities');

const cleanFileName = (fileName) =>
  path
    .basename(String(fileName || 'attestation'))
    .replace(/[^a-zA-Z0-9._() -]+/g, '-')
    .trim()
    .slice(0, 255) || 'attestation';

const getStoredPath = (storagePath) => {
  const absolutePath = path.resolve(uploadsRoot, String(storagePath || ''));

  if (!absolutePath.startsWith(`${uploadsRoot}${path.sep}`)) {
    throw new Error('ACTIVITY_CERTIFICATE_FILE_NOT_FOUND');
  }

  return absolutePath;
};

const storeActivityCertificate = async (file) => {
  await fs.mkdir(activityUploadsDir, { recursive: true });

  const extension = path.extname(file.originalname || '').toLowerCase().slice(0, 12);
  const storedFileName = `activity-${crypto.randomUUID()}${extension}`;
  const storagePath = path.posix.join('activities', storedFileName);

  await fs.writeFile(getStoredPath(storagePath), file.buffer);

  return {
    fileName: cleanFileName(file.originalname),
    fileSize: file.size,
    mimeType: file.mimetype,
    storagePath,
  };
};

const getActivityCertificatePath = (storagePath) => getStoredPath(storagePath);

const deleteActivityCertificate = async (storagePath) => {
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
  deleteActivityCertificate,
  getActivityCertificatePath,
  storeActivityCertificate,
};
