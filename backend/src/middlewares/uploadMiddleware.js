'use strict';

const multer = require('multer');

const { error } = require('../utils/apiResponse');

const DEFAULT_ALLOWED_MIME_TYPES = [
  'application/msword',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
];

const parseInteger = (value, defaultValue) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : defaultValue;
};

const getMaxFileSize = () => {
  const maxMb = parseInteger(process.env.UPLOAD_MAX_MB, 10);
  return maxMb * 1024 * 1024;
};

const getAllowedMimeTypes = () => {
  if (!process.env.UPLOAD_ALLOWED_MIME_TYPES) return DEFAULT_ALLOWED_MIME_TYPES;

  return process.env.UPLOAD_ALLOWED_MIME_TYPES
    .split(',')
    .map((mimeType) => mimeType.trim())
    .filter(Boolean);
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: getMaxFileSize(),
    files: 10,
  },
  fileFilter: (_req, file, callback) => {
    const allowedMimeTypes = getAllowedMimeTypes();

    if (!allowedMimeTypes.includes(file.mimetype)) {
      const err = new Error('UNSUPPORTED_FILE_TYPE');
      err.status = 415;
      err.allowedMimeTypes = allowedMimeTypes;
      return callback(err);
    }

    return callback(null, true);
  },
});

const handleMulterResult = (req, res, next, uploadHandler) => {
  uploadHandler(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return error(res, 413, 'Fichier trop volumineux.');
    }

    if (err instanceof multer.MulterError) {
      return error(res, 400, 'Upload invalide.', { code: err.code });
    }

    if (err.message === 'UNSUPPORTED_FILE_TYPE') {
      return error(res, 415, 'Type de fichier non autorise.', {
        allowedMimeTypes: err.allowedMimeTypes,
      });
    }

    return next(err);
  });
};

exports.uploadSingleFile = (fieldName = 'file') => (req, res, next) =>
  handleMulterResult(req, res, next, upload.single(fieldName));

exports.uploadMultipleFiles = (fieldName = 'files', maxCount = 10) => (req, res, next) =>
  handleMulterResult(req, res, next, upload.array(fieldName, maxCount));

exports.uploadFields = (fields = []) => (req, res, next) =>
  handleMulterResult(req, res, next, upload.fields(fields));
