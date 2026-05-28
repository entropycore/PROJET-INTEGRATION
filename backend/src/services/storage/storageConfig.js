'use strict';

const path = require('path');

const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

const parseInteger = (value, defaultValue) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : defaultValue;
};

const normalizeDriver = (value) => {
  const driver = String(value || 'local').toLowerCase();
  return driver === 'local' ? 'local' : 's3';
};

const driver = normalizeDriver(process.env.STORAGE_DRIVER);
const minioScheme = parseBoolean(process.env.MINIO_USE_SSL, false) ? 'https' : 'http';
const minioEndpoint = process.env.MINIO_ENDPOINT
  ? `${minioScheme}://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT || 9000}`
  : null;
const bucket =
  process.env.S3_BUCKET ||
  process.env.STORAGE_BUCKET ||
  process.env.MINIO_BUCKET ||
  'student-uploads';
const minioPublicBaseUrl = process.env.MINIO_PUBLIC_URL
  ? `${process.env.MINIO_PUBLIC_URL.replace(/\/$/, '')}/${bucket}`
  : null;

module.exports = {
  driver,
  bucket,
  region: process.env.S3_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT || minioEndpoint,
  accessKeyId: process.env.S3_ACCESS_KEY_ID || process.env.MINIO_ROOT_USER || null,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || process.env.MINIO_ROOT_PASSWORD || null,
  forcePathStyle: parseBoolean(process.env.S3_FORCE_PATH_STYLE, true),
  publicBaseUrl: process.env.S3_PUBLIC_BASE_URL || minioPublicBaseUrl,
  autoCreateBucket: parseBoolean(process.env.STORAGE_AUTO_CREATE_BUCKET, false),
  bucketPublicRead: parseBoolean(process.env.STORAGE_BUCKET_PUBLIC_READ, false),
  signedUrlTtlSeconds: parseInteger(process.env.SIGNED_URL_TTL_SECONDS, 300),
  localUploadDir: path.resolve(
    process.cwd(),
    process.env.LOCAL_UPLOAD_DIR || 'uploads'
  ),
};
