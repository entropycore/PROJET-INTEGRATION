'use strict';

const multer = require('multer');

const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const REPORT_MIME_TYPES = new Set(['application/pdf']);

const stageMediaUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (file.fieldname === 'report' && REPORT_MIME_TYPES.has(file.mimetype)) {
      return cb(null, true);
    }

    if (file.fieldname === 'images' && IMAGE_MIME_TYPES.has(file.mimetype)) {
      return cb(null, true);
    }

    return cb(new Error('Format de fichier stage non autorisé.'));
  },
  limits: {
    files: 8,
    fileSize: 10 * 1024 * 1024,
  },
}).fields([
  { name: 'report', maxCount: 1 },
  { name: 'images', maxCount: 7 },
]);

module.exports = (req, res, next) => {
  stageMediaUpload(req, res, (err) => {
    if (err) {
      err.status = 400;
      return next(err);
    }

    next();
  });
};
