'use strict';

const multer = require('multer');

const SCREENSHOT_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ATTACHMENT_MIME_TYPES = new Set([
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

const projectMediaUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (file.fieldname === 'screenshots' && SCREENSHOT_MIME_TYPES.has(file.mimetype)) {
      return cb(null, true);
    }

    if (file.fieldname === 'attachments' && ATTACHMENT_MIME_TYPES.has(file.mimetype)) {
      return cb(null, true);
    }

    return cb(new Error('Format de fichier projet non autorisé.'));
  },
  limits: {
    files: 10,
    fileSize: 10 * 1024 * 1024,
  },
}).fields([
  { name: 'screenshots', maxCount: 6 },
  { name: 'attachments', maxCount: 4 },
]);

module.exports = (req, res, next) => {
  projectMediaUpload(req, res, (err) => {
    if (err) {
      err.status = 400;
      return next(err);
    }

    next();
  });
};
