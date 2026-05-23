'use strict';
const multer = require('multer');

const CERTIFICATE_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const activityCertificateUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (CERTIFICATE_MIME_TYPES.has(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error('Format de fichier non autorisé. PDF ou image uniquement.'));
  },
  limits: {
    files: 1,
    fileSize: 5 * 1024 * 1024,
  },
}).single('certificate');

module.exports = (req, res, next) => {
  activityCertificateUpload(req, res, (err) => {
    if (err) {
      err.status = 400;
      return next(err);
    }
    next();
  });
};