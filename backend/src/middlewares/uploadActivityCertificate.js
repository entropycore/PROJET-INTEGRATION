'use strict';

const multer = require('multer');

const CERTIFICATE_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
]);

const certificateUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (file.fieldname === 'certificate' && CERTIFICATE_MIME_TYPES.has(file.mimetype)) {
      return cb(null, true);
    }

    return cb(new Error("Format d'attestation non autorisé."));
  },
  limits: {
    files: 1,
    fileSize: 8 * 1024 * 1024,
  },
}).single('certificate');

module.exports = (req, res, next) => {
  certificateUpload(req, res, (err) => {
    if (err) {
      err.status = 400;
      return next(err);
    }

    next();
  });
};
