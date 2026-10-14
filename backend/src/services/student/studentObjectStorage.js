'use strict';

const crypto = require('crypto');
const path = require('path');

const storageService = require('../storage/storageService');

const cleanFileName = (fileName, fallbackName) =>
  path
    .basename(String(fileName || fallbackName))
    .replace(/[^a-zA-Z0-9._() -]+/g, '-')
    .trim()
    .slice(0, 255) || fallbackName;

const buildObjectKey = (folder, prefix, originalName) => {
  const extension = path.extname(originalName || '').toLowerCase().slice(0, 12);
  return path.posix.join(folder, `${prefix}-${crypto.randomUUID()}${extension}`);
};

const storeStudentObject = async ({ file, folder, prefix, fallbackName }) => {
  const objectKey = buildObjectKey(folder, prefix, file.originalname);
  const result = await storageService.uploadObject({
    objectKey,
    buffer: file.buffer,
    mimeType: file.mimetype,
  });

  return {
    fileName: cleanFileName(file.originalname, fallbackName),
    fileSize: file.size,
    mimeType: file.mimetype,
    storagePath: result.objectKey,
    publicUrl: result.publicUrl,
  };
};

const deleteStudentObject = async (storagePath) => {
  if (!storagePath) return;

  await storageService.deleteObject(storagePath);
};

const getStudentObjectTarget = async ({
  storagePath,
  originalName,
  mimeType,
  contentDisposition = 'attachment',
  notFoundCode,
}) => {
  if (!storagePath) {
    throw new Error(notFoundCode);
  }

  try {
    return await storageService.getDownloadTarget({
      objectKey: storagePath,
      originalName,
      mimeType,
      contentDisposition,
    });
  } catch (err) {
    if (err.message === 'STORAGE_OBJECT_NOT_FOUND') {
      throw new Error(notFoundCode, { cause: err });
    }

    throw err;
  }
};

module.exports = {
  deleteStudentObject,
  getStudentObjectTarget,
  storeStudentObject,
};
