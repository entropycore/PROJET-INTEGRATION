'use strict';

const crypto = require('crypto');
const path = require('path');

const prisma = require('../config/prisma');
const logger = require('../logs/logger');
const storageService = require('./storage/storageService');

const ACCESS_VALUES = new Set(['PRIVATE', 'PUBLIC']);
const ENTITY_TYPES = new Set([
  'PROJECT',
  'INTERNSHIP',
  'ACTIVITY',
  'EXTRACURRICULAR_ACTIVITY',
  'CERTIFICATE',
  'PORTFOLIO',
  'RECOMMENDATION_LETTER',
  'RECOMMENDATION',
  'COMMENT',
]);
const MAX_METADATA_BYTES = 4096;

const createServiceError = (message, status = 400, details = null) => {
  const err = new Error(message);
  err.status = status;
  if (details) err.details = details;
  return err;
};

const normalizeEnumValue = (value, fallback = null) => {
  if (!value) return fallback;
  const normalized = String(value).trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '_');
  return normalized || fallback;
};

const normalizeAccess = (value) => {
  const access = normalizeEnumValue(value, 'PRIVATE');
  if (!ACCESS_VALUES.has(access)) {
    throw createServiceError('INVALID_FILE_ACCESS', 400, {
      allowedValues: Array.from(ACCESS_VALUES),
    });
  }

  return access;
};

const parseMetadata = (value) => {
  if (!value) return {};

  if (typeof value === 'object') return value;

  try {
    if (Buffer.byteLength(value, 'utf8') > MAX_METADATA_BYTES) {
      throw createServiceError('INVALID_FILE_METADATA', 400, {
        maxBytes: MAX_METADATA_BYTES,
      });
    }

    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('INVALID_METADATA');
    }
    return parsed;
  } catch (_err) {
    throw createServiceError('INVALID_FILE_METADATA', 400);
  }
};

const sanitizeExtension = (originalName) => {
  const extension = path.extname(originalName || '').toLowerCase();
  if (!extension) return '';
  return extension.replace(/[^a-z0-9.]/g, '').slice(0, 16);
};

const buildObjectKey = ({ userId, purpose, originalName }) => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const safePurpose = String(purpose || 'general')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'general';
  const extension = sanitizeExtension(originalName);

  return `${safePurpose}/${userId}/${year}/${month}/${crypto.randomUUID()}${extension}`;
};

const checksumSha256 = (buffer) =>
  crypto.createHash('sha256').update(buffer).digest('hex');

const startsWithBytes = (buffer, bytes) =>
  bytes.every((byte, index) => buffer[index] === byte);

const hasAsciiHeader = (buffer, header) =>
  buffer.subarray(0, header.length).toString('ascii') === header;

const validateFileSignature = (file) => {
  const buffer = file.buffer || Buffer.alloc(0);
  const mimeType = file.mimetype;

  const valid =
    (mimeType === 'application/pdf' && hasAsciiHeader(buffer, '%PDF-')) ||
    (mimeType === 'image/png' &&
      startsWithBytes(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) ||
    (mimeType === 'image/jpeg' && startsWithBytes(buffer, [0xff, 0xd8, 0xff])) ||
    (mimeType === 'image/gif' &&
      (hasAsciiHeader(buffer, 'GIF87a') || hasAsciiHeader(buffer, 'GIF89a'))) ||
    (mimeType === 'image/webp' &&
      hasAsciiHeader(buffer, 'RIFF') &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP') ||
    (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' &&
      hasAsciiHeader(buffer, 'PK')) ||
    (mimeType === 'application/msword' &&
      startsWithBytes(buffer, [0xd0, 0xcf, 0x11, 0xe0])) ||
    mimeType === 'text/plain';

  if (!valid) {
    throw createServiceError('UNSUPPORTED_FILE_TYPE', 415, {
      mimeType,
      reason: 'FILE_SIGNATURE_MISMATCH',
    });
  }
};

const mapUploadedFile = (row) => ({
  id: row.id,
  ownerUserId: row.ownerUserId,
  storageProvider: row.storageProvider,
  bucket: row.bucket,
  objectKey: row.objectKey,
  originalName: row.originalName,
  mimeType: row.mimeType,
  sizeBytes: row.sizeBytes,
  checksumSha256: row.checksumSha256,
  access: row.access,
  entityType: row.entityType,
  entityId: row.entityId,
  purpose: row.purpose,
  publicUrl: row.publicUrl,
  metadata: row.metadata,
  createdAt: row.createdAt,
  deletedAt: row.deletedAt,
  downloadUrl: `/api/files/${row.id}/download`,
  publicDownloadUrl: row.access === 'PUBLIC' ? `/api/files/public/${row.id}/download` : null,
});

const insertUploadedFile = async (data) => {
  const metadataJson = JSON.stringify(data.metadata || {});

  const rows = await prisma.$queryRaw`
    INSERT INTO "uploaded_files" (
      "id_uploaded_file",
      "owner_user_id",
      "storage_provider",
      "bucket",
      "object_key",
      "original_name",
      "mime_type",
      "size_bytes",
      "checksum_sha256",
      "access",
      "entity_type",
      "entity_id",
      "purpose",
      "public_url",
      "metadata"
    )
    VALUES (
      ${data.id},
      ${data.ownerUserId},
      ${data.storageProvider},
      ${data.bucket},
      ${data.objectKey},
      ${data.originalName},
      ${data.mimeType},
      ${data.sizeBytes},
      ${data.checksumSha256},
      ${data.access},
      ${data.entityType},
      ${data.entityId},
      ${data.purpose},
      ${data.publicUrl},
      CAST(${metadataJson} AS JSONB)
    )
    RETURNING
      "id_uploaded_file" AS "id",
      "owner_user_id" AS "ownerUserId",
      "storage_provider" AS "storageProvider",
      "bucket",
      "object_key" AS "objectKey",
      "original_name" AS "originalName",
      "mime_type" AS "mimeType",
      "size_bytes" AS "sizeBytes",
      "checksum_sha256" AS "checksumSha256",
      "access",
      "entity_type" AS "entityType",
      "entity_id" AS "entityId",
      "purpose",
      "public_url" AS "publicUrl",
      "metadata",
      "created_at" AS "createdAt",
      "deleted_at" AS "deletedAt"
  `;

  return rows[0];
};

const findUploadedFileById = async (fileId) => {
  const rows = await prisma.$queryRaw`
    SELECT
      "id_uploaded_file" AS "id",
      "owner_user_id" AS "ownerUserId",
      "storage_provider" AS "storageProvider",
      "bucket",
      "object_key" AS "objectKey",
      "original_name" AS "originalName",
      "mime_type" AS "mimeType",
      "size_bytes" AS "sizeBytes",
      "checksum_sha256" AS "checksumSha256",
      "access",
      "entity_type" AS "entityType",
      "entity_id" AS "entityId",
      "purpose",
      "public_url" AS "publicUrl",
      "metadata",
      "created_at" AS "createdAt",
      "deleted_at" AS "deletedAt"
    FROM "uploaded_files"
    WHERE "id_uploaded_file" = ${fileId}
      AND "deleted_at" IS NULL
    LIMIT 1
  `;

  return rows[0] || null;
};

const canReadFile = (user, file) =>
  file.access === 'PUBLIC' ||
  String(user?.role || '').toUpperCase() === 'ADMINISTRATOR' ||
  file.ownerUserId === user?.userId;

const isProfessor = (user) =>
  String(user?.role || '').toUpperCase() === 'PROFESSOR';

const professorCanReadEntityFile = async (user, file) => {
  if (!isProfessor(user) || !file.entityType || !file.entityId) {
    return false;
  }

  const professor = await prisma.professor.findUnique({
    where: { userId: user.userId },
    select: { id: true },
  });

  if (!professor) return false;

  if (file.entityType === 'PROJECT') {
    const project = await prisma.project.findFirst({
      where: {
        id: file.entityId,
        validatorProfessorId: professor.id,
      },
      select: { id: true },
    });

    return Boolean(project);
  }

  if (file.entityType === 'INTERNSHIP') {
    const internship = await prisma.internship.findFirst({
      where: {
        id: file.entityId,
        supervisorProfessorId: professor.id,
      },
      select: { id: true },
    });

    return Boolean(internship);
  }

  return false;
};

const canReadFileForUser = async (user, file) => {
  if (canReadFile(user, file)) return true;

  return professorCanReadEntityFile(user, file);
};

const canDeleteFile = (user, file) =>
  String(user?.role || '').toUpperCase() === 'ADMINISTRATOR' ||
  file.ownerUserId === user?.userId;

const isAdministrator = (user) =>
  String(user?.role || '').toUpperCase() === 'ADMINISTRATOR';

const getEntityOwnerUserId = async (entityType, entityId) => {
  switch (entityType) {
    case 'PROJECT': {
      const entity = await prisma.project.findUnique({
        where: { id: entityId },
        select: { student: { select: { userId: true } } },
      });
      return entity?.student?.userId || null;
    }

    case 'INTERNSHIP': {
      const entity = await prisma.internship.findUnique({
        where: { id: entityId },
        select: { student: { select: { userId: true } } },
      });
      return entity?.student?.userId || null;
    }

    case 'ACTIVITY':
    case 'EXTRACURRICULAR_ACTIVITY': {
      const entity = await prisma.extracurricularActivity.findUnique({
        where: { id: entityId },
        select: { student: { select: { userId: true } } },
      });
      return entity?.student?.userId || null;
    }

    case 'CERTIFICATE': {
      const entity = await prisma.certificate.findUnique({
        where: { id: entityId },
        select: { activity: { select: { student: { select: { userId: true } } } } },
      });
      return entity?.activity?.student?.userId || null;
    }

    case 'PORTFOLIO': {
      const entity = await prisma.portfolio.findUnique({
        where: { id: entityId },
        select: { student: { select: { userId: true } } },
      });
      return entity?.student?.userId || null;
    }

    case 'RECOMMENDATION_LETTER': {
      const entity = await prisma.recommendationLetter.findUnique({
        where: { id: entityId },
        select: { student: { select: { userId: true } }, authorUserId: true },
      });
      return entity?.student?.userId || entity?.authorUserId || null;
    }

    case 'RECOMMENDATION': {
      const entity = await prisma.recommendation.findUnique({
        where: { id: entityId },
        select: { student: { select: { userId: true } }, authorUserId: true },
      });
      return entity?.student?.userId || entity?.authorUserId || null;
    }

    case 'COMMENT': {
      const entity = await prisma.comment.findUnique({
        where: { id: entityId },
        select: {
          authorUserId: true,
          portfolio: { select: { student: { select: { userId: true } } } },
        },
      });
      return entity?.portfolio?.student?.userId || entity?.authorUserId || null;
    }

    default:
      throw createServiceError('INVALID_FILE_ENTITY', 400, {
        allowedEntityTypes: Array.from(ENTITY_TYPES),
      });
  }
};

const assertEntityAccess = async ({ user, entityType, entityId }) => {
  if (!entityType && !entityId) return;

  if (!entityType || !entityId || !ENTITY_TYPES.has(entityType)) {
    throw createServiceError('INVALID_FILE_ENTITY', 400, {
      allowedEntityTypes: Array.from(ENTITY_TYPES),
    });
  }

  const ownerUserId = await getEntityOwnerUserId(entityType, entityId);

  if (!ownerUserId) {
    throw createServiceError('FILE_ENTITY_NOT_FOUND', 404);
  }

  if (!isAdministrator(user) && ownerUserId !== user.userId) {
    throw createServiceError('FILE_ACCESS_DENIED', 403);
  }
};

exports.uploadFile = async ({ user, file, payload = {} }) => {
  if (!file) {
    throw createServiceError('FILE_REQUIRED', 400);
  }

  validateFileSignature(file);

  const access = normalizeAccess(payload.access);
  const purpose = normalizeEnumValue(payload.purpose, 'GENERAL');
  const entityType = normalizeEnumValue(payload.entityType, null);
  const entityId = payload.entityId ? String(payload.entityId) : null;
  const metadata = parseMetadata(payload.metadata);

  if (Buffer.byteLength(JSON.stringify(metadata), 'utf8') > MAX_METADATA_BYTES) {
    throw createServiceError('INVALID_FILE_METADATA', 400, {
      maxBytes: MAX_METADATA_BYTES,
    });
  }

  await assertEntityAccess({ user, entityType, entityId });

  const objectKey = buildObjectKey({
    userId: user.userId,
    purpose,
    originalName: file.originalname,
  });

  const uploadResult = await storageService.uploadObject({
    objectKey,
    buffer: file.buffer,
    mimeType: file.mimetype,
    metadata: {
      ownerUserId: user.userId,
      purpose,
    },
  });

  try {
    const row = await insertUploadedFile({
      id: crypto.randomUUID(),
      ownerUserId: user.userId,
      storageProvider: storageService.getStorageConfig().driver,
      bucket: uploadResult.bucket,
      objectKey: uploadResult.objectKey,
      originalName: file.originalname || 'file',
      mimeType: file.mimetype,
      sizeBytes: file.size,
      checksumSha256: checksumSha256(file.buffer),
      access,
      entityType,
      entityId,
      purpose,
      publicUrl: access === 'PUBLIC' ? uploadResult.publicUrl : null,
      metadata,
    });

    return mapUploadedFile(row);
  } catch (err) {
    await storageService.deleteObject(objectKey).catch(() => null);
    throw err;
  }
};

exports.uploadFiles = async ({ user, files = [], payload = {} }) => {
  if (!files.length) {
    throw createServiceError('FILE_REQUIRED', 400);
  }

  const uploadedFiles = [];

  try {
    for (const file of files) {
      uploadedFiles.push(await exports.uploadFile({ user, file, payload }));
    }
  } catch (err) {
    await Promise.all(
      uploadedFiles.map((uploadedFile) =>
        exports.deleteFile({ user, fileId: uploadedFile.id }).catch(() => null)
      )
    );
    throw err;
  }

  return uploadedFiles;
};

exports.getFileMetadata = async ({ user, fileId }) => {
  const file = await findUploadedFileById(fileId);

  if (!file) {
    throw createServiceError('FILE_NOT_FOUND', 404);
  }

  if (!(await canReadFileForUser(user, file))) {
    throw createServiceError('FILE_ACCESS_DENIED', 403);
  }

  return mapUploadedFile(file);
};

exports.getPublicFileMetadata = async ({ fileId }) => {
  const file = await findUploadedFileById(fileId);

  if (!file || file.access !== 'PUBLIC') {
    throw createServiceError('FILE_NOT_FOUND', 404);
  }

  return mapUploadedFile(file);
};

exports.getDownloadTarget = async ({ user, fileId }) => {
  const file = await findUploadedFileById(fileId);

  if (!file) {
    throw createServiceError('FILE_NOT_FOUND', 404);
  }

  if (!(await canReadFileForUser(user, file))) {
    throw createServiceError('FILE_ACCESS_DENIED', 403);
  }

  const target = await storageService.getDownloadTarget({
    objectKey: file.objectKey,
    originalName: file.originalName,
    mimeType: file.mimeType,
    contentDisposition: 'attachment',
  });

  return {
    file: mapUploadedFile(file),
    target,
  };
};

exports.getPublicDownloadTarget = async ({ fileId }) => {
  const file = await findUploadedFileById(fileId);

  if (!file || file.access !== 'PUBLIC') {
    throw createServiceError('FILE_NOT_FOUND', 404);
  }

  const target = await storageService.getDownloadTarget({
    objectKey: file.objectKey,
    originalName: file.originalName,
    mimeType: file.mimeType,
    contentDisposition: 'inline',
  });

  return {
    file: mapUploadedFile(file),
    target,
  };
};

exports.deleteFile = async ({ user, fileId }) => {
  const file = await findUploadedFileById(fileId);

  if (!file) {
    throw createServiceError('FILE_NOT_FOUND', 404);
  }

  if (!canDeleteFile(user, file)) {
    throw createServiceError('FILE_ACCESS_DENIED', 403);
  }

  const rows = await prisma.$queryRaw`
    UPDATE "uploaded_files"
    SET "deleted_at" = CURRENT_TIMESTAMP
    WHERE "id_uploaded_file" = ${fileId}
      AND "deleted_at" IS NULL
    RETURNING
      "id_uploaded_file" AS "id",
      "owner_user_id" AS "ownerUserId",
      "storage_provider" AS "storageProvider",
      "bucket",
      "object_key" AS "objectKey",
      "original_name" AS "originalName",
      "mime_type" AS "mimeType",
      "size_bytes" AS "sizeBytes",
      "checksum_sha256" AS "checksumSha256",
      "access",
      "entity_type" AS "entityType",
      "entity_id" AS "entityId",
      "purpose",
      "public_url" AS "publicUrl",
      "metadata",
      "created_at" AS "createdAt",
      "deleted_at" AS "deletedAt"
  `;

  try {
    await storageService.deleteObject(file.objectKey);
  } catch (err) {
    logger.warn({
      message: 'Storage object deletion failed after metadata deletion',
      fileId,
      objectKey: file.objectKey,
      error: err.message,
    });
  }

  return mapUploadedFile(rows[0]);
};
