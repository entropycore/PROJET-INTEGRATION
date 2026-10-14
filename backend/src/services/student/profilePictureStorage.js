'use strict';

const path = require('path');

const {
  deleteStudentObject,
  getStudentObjectTarget,
  storeStudentObject,
} = require('./studentObjectStorage');

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
  const storedFile = await storeStudentObject({
    file,
    folder: 'profiles',
    prefix: 'profile',
    fallbackName: 'profile-picture',
  });

  return {
    ...storedFile,
    publicUrl: buildProfilePictureUrl(storedFile.storagePath),
  };
};

const getProfilePictureTarget = (fileName) => {
  const safeName = path.basename(String(fileName || ''));

  if (!safeName) {
    throw new Error('PROFILE_PICTURE_FILE_NOT_FOUND');
  }

  return getStudentObjectTarget({
    storagePath: path.posix.join('profiles', safeName),
    contentDisposition: 'inline',
    notFoundCode: 'PROFILE_PICTURE_FILE_NOT_FOUND',
  });
};

module.exports = {
  deleteProfilePicture: deleteStudentObject,
  getProfilePicturePath: getProfilePictureTarget,
  getProfilePictureTarget,
  getStoragePathFromUrl,
  storeProfilePicture,
};
