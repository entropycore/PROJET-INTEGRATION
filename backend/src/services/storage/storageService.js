'use strict';

const config = require('./storageConfig');
const localStorageProvider = require('./localStorageProvider');
const s3StorageProvider = require('./s3StorageProvider');

const getProvider = () => {
  if (config.driver === 'local') return localStorageProvider;
  return s3StorageProvider;
};

exports.getStorageConfig = () => config;

exports.uploadObject = (payload) => getProvider().uploadObject(payload);

exports.deleteObject = (objectKey) => getProvider().deleteObject(objectKey);

exports.getDownloadTarget = (payload) => getProvider().getDownloadTarget(payload);
