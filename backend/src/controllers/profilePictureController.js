'use strict';

const path = require('path');

const { getProfilePicturePath } = require('../services/student/profilePictureStorage');
const sendStoredFile = require('../utils/sendStoredFile');

const imageMimeTypes = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

const getImageMimeType = (fileName) => {
  const extension = path.extname(String(fileName || '')).toLowerCase();
  return imageMimeTypes[extension] || 'application/octet-stream';
};

exports.getProfilePicture = async (req, res, next) => {
  try {
    const target = await getProfilePicturePath(req.params.fileName);
    return sendStoredFile(
      res,
      {
        target,
        downloadName: req.params.fileName || 'profile-picture',
        mimeType: getImageMimeType(req.params.fileName),
      },
      next
    );
  } catch (err) {
    if (err.message === 'PROFILE_PICTURE_FILE_NOT_FOUND') {
      err.status = 404;
    }
    next(err);
  }
};
