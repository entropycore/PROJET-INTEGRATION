'use strict';

const config = require('./storageConfig');
const s3StorageProvider = require('./s3StorageProvider');

const getProvider = () => s3StorageProvider;

exports.getStorageConfig = () => config;

exports.uploadObject = (payload) => getProvider().uploadObject(payload);

exports.deleteObject = (objectKey) => getProvider().deleteObject(objectKey);

exports.getDownloadTarget = (payload) => getProvider().getDownloadTarget(payload);
