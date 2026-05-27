'use strict';

const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');

const uploadsRoot = path.resolve(__dirname, '..', '..', '..', 'uploads');
const profilesDir = path.join(uploadsRoot, 'profiles');

const cleanFileName = (fileName) =>
  path
    .basename(String(fileName || 'profile-picture'))
    .replace(/[^a-zA-Z0-9._() -]+/g, '-')
    .trim()
    .slice(0, 255) || 'profile-picture';

const getStoredPath = (storagePath) => {
  const absolutePath = path.resolve(uploadsRoot, String(storagePath || ''));

  if (!absolutePath.startsWith(`${uploadsRoot}${path.sep}`)) {
    throw new Error('PROFILE_PICTURE_FILE_NOT_FOUND');
  }

  return absolutePath;
};

const buildProfilePictureUrl = (storagePath) =>
  `/api/profile-pictures/${encodeURIComponent(path.basename(storagePath))}`;

const getStoragePathFromUrl = (url) => {
  const value = String(url || '').trim();
  const marker = '/api/profile-pictures/';

  if (!value.includes(marker)) {
    return null;
  }

  const fileName = decodeURIComponent(value.split(marker).pop() || '');
  const safeName = path.basename(fileName);

  return safeName ? path.posix.join('profiles', safeName) : null;
};

const storeProfilePicture = async (file) => {
  await fs.mkdir(profilesDir, { recursive: true });

  const extension = path.extname(file.originalname || '').toLowerCase().slice(0, 12);
  const storedFileName = `profile-${crypto.randomUUID()}${extension}`;
  const storagePath = path.posix.join('profiles', storedFileName);

  await fs.writeFile(getStoredPath(storagePath), file.buffer);

  return {
    fileName: cleanFileName(file.originalname),
    fileSize: file.size,
    mimeType: file.mimetype,
    storagePath,
    publicUrl: buildProfilePictureUrl(storagePath),
  };
};

const getProfilePicturePath = (fileName) => {
  const safeName = path.basename(String(fileName || ''));

  if (!safeName) {
    throw new Error('PROFILE_PICTURE_FILE_NOT_FOUND');
  }

  return getStoredPath(path.posix.join('profiles', safeName));
};

const deleteProfilePicture = async (storagePath) => {
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
  deleteProfilePicture,
  getProfilePicturePath,
  getStoragePathFromUrl,
  storeProfilePicture,
};
