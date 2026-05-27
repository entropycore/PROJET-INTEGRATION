'use strict';

const { getProfilePicturePath } = require('../services/student/profilePictureStorage');
const sendStoredFile = require('../utils/sendStoredFile');

exports.getProfilePicture = async (req, res, next) => {
  try {
    const target = await getProfilePicturePath(req.params.fileName);
    return sendStoredFile(
      res,
      {
        target,
        downloadName: req.params.fileName || 'profile-picture',
        mimeType: 'application/octet-stream',
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
