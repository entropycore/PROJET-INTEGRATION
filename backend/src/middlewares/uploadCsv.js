'use strict';

const multer = require('multer');

const csvStorage = multer.memoryStorage();

const uploadCsv = multer({
  storage: csvStorage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    const isCsv =
      file.mimetype === 'text/csv' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.originalname.toLowerCase().endsWith('.csv');

    if (!isCsv) {
      const error = new Error('Le fichier importe doit etre un CSV.');
      error.status = 400;
      return callback(error);
    }

    return callback(null, true);
  },
});

module.exports = uploadCsv;
