'use strict';

const {
  deleteStudentObject,
  getStudentObjectTarget,
  storeStudentObject,
} = require('./studentObjectStorage');

const storeActivityCertificate = (file) =>
  storeStudentObject({
    file,
    folder: 'activities',
    prefix: 'activity',
    fallbackName: 'attestation',
  });

const getActivityCertificateTarget = (storagePath, options = {}) =>
  getStudentObjectTarget({
    storagePath,
    originalName: options.originalName,
    mimeType: options.mimeType,
    contentDisposition: options.contentDisposition,
    notFoundCode: 'ACTIVITY_CERTIFICATE_FILE_NOT_FOUND',
  });

module.exports = {
  deleteActivityCertificate: deleteStudentObject,
  getActivityCertificateTarget,
  storeActivityCertificate,
};
