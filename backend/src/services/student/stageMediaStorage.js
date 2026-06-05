'use strict';

const {
  deleteStudentObject,
  getStudentObjectTarget,
  storeStudentObject,
} = require('./studentObjectStorage');

const storeStageFile = (file, prefix) =>
  storeStudentObject({
    file,
    folder: 'stages',
    prefix,
    fallbackName: 'fichier',
  });

const getStageFileTarget = (storagePath, options = {}) =>
  getStudentObjectTarget({
    storagePath,
    originalName: options.originalName,
    mimeType: options.mimeType,
    contentDisposition: options.contentDisposition,
    notFoundCode: 'STAGE_FILE_NOT_FOUND',
  });

module.exports = {
  deleteStageFile: deleteStudentObject,
  getStageFileTarget,
  storeStageFile,
};
