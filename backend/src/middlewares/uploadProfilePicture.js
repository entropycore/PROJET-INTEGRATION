'use strict';

const multer = require('multer');

const PROFILE_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const profilePictureUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (file.fieldname === 'profilePicture' && PROFILE_IMAGE_TYPES.has(file.mimetype)) {
      return cb(null, true);
    }

    return cb(new Error('Format de photo de profil non autorise.'));
  },
  limits: {
    files: 1,
    fileSize: 3 * 1024 * 1024,
  },
}).single('profilePicture');

module.exports = (req, res, next) => {
  profilePictureUpload(req, res, (err) => {
    if (err) {
      err.status = 400;
      return next(err);
    }

    next();
  });
};
