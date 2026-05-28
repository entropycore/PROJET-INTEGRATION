'use strict';

const { getProfilePicturePath } = require('../services/student/profilePictureStorage');

exports.getProfilePicture = async (req, res, next) => {
  try {
    const absolutePath = getProfilePicturePath(req.params.fileName);
    return res.sendFile(absolutePath, (err) => {
      if (err) next(err);
    });
  } catch (err) {
    if (err.message === 'PROFILE_PICTURE_FILE_NOT_FOUND') {
      err.status = 404;
    }
    next(err);
  }
};
