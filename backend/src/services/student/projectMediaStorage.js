'use strict';

const {
  deleteStudentObject,
  getStudentObjectTarget,
  storeStudentObject,
} = require('./studentObjectStorage');

exports.storeProjectFile = (file) =>
  storeStudentObject({
    file,
    folder: 'projects',
    prefix: 'project',
    fallbackName: 'fichier',
  });

exports.getProjectFileTarget = (storagePath, options = {}) =>
  getStudentObjectTarget({
    storagePath,
    originalName: options.originalName,
    mimeType: options.mimeType,
    contentDisposition: options.contentDisposition,
    notFoundCode: 'PROJECT_MEDIA_FILE_NOT_FOUND',
  });

exports.deleteProjectFile = deleteStudentObject;
