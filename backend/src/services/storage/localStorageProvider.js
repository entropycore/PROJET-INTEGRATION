'use strict';

const fs = require('fs');
const path = require('path');

const config = require('./storageConfig');

const getAbsolutePath = (objectKey) => path.join(config.localUploadDir, objectKey);

exports.uploadObject = async ({ objectKey, buffer }) => {
  const absolutePath = getAbsolutePath(objectKey);

  await fs.promises.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.promises.writeFile(absolutePath, buffer);

  return {
    bucket: config.bucket,
    objectKey,
    publicUrl: null,
  };
};

exports.deleteObject = async (objectKey) => {
  const absolutePath = getAbsolutePath(objectKey);
  await fs.promises.rm(absolutePath, { force: true });
};

exports.getDownloadTarget = async ({ objectKey, contentDisposition = 'attachment' }) => {
  const absolutePath = getAbsolutePath(objectKey);
  return {
    mode: 'stream',
    contentDisposition,
    stream: fs.createReadStream(absolutePath),
  };
};
