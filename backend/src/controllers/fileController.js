'use strict';

const fileService = require('../services/fileService');
const { success, error } = require('../utils/apiResponse');

const fileErrorMessages = {
  FILE_REQUIRED: 'Aucun fichier recu.',
  FILE_NOT_FOUND: 'Fichier introuvable.',
  FILE_ACCESS_DENIED: 'Acces refuse au fichier.',
  INVALID_FILE_ACCESS: 'Visibilite de fichier invalide.',
  INVALID_FILE_METADATA: 'Metadata de fichier invalide.',
  INVALID_FILE_ENTITY: 'Entite de fichier invalide.',
  FILE_ENTITY_NOT_FOUND: 'Entite liee au fichier introuvable.',
  UNSUPPORTED_FILE_TYPE: 'Type de fichier non autorise.',
};

const buildContentDisposition = (type, filename) => {
  const fallback = String(filename || 'file').replace(/[^\x20-\x7E]/g, '_').replace(/["\\]/g, '_');
  const encoded = encodeURIComponent(filename || 'file');
  return `${type}; filename="${fallback}"; filename*=UTF-8''${encoded}`;
};

const handleFileError = (res, err) => {
  if (!err.status) return false;

  return error(
    res,
    err.status,
    fileErrorMessages[err.message] || err.message,
    err.details || null
  );
};

exports.uploadFile = async (req, res, next) => {
  try {
    const uploadedFile = await fileService.uploadFile({
      user: req.user,
      file: req.file,
      payload: req.body,
    });

    return success(res, 201, 'Fichier envoye avec succes.', uploadedFile);
  } catch (err) {
    if (handleFileError(res, err)) return;
    next(err);
  }
};

exports.uploadFiles = async (req, res, next) => {
  try {
    const uploadedFiles = await fileService.uploadFiles({
      user: req.user,
      files: req.files,
      payload: req.body,
    });

    return success(res, 201, 'Fichiers envoyes avec succes.', uploadedFiles);
  } catch (err) {
    if (handleFileError(res, err)) return;
    next(err);
  }
};

exports.getFileMetadata = async (req, res, next) => {
  try {
    const file = await fileService.getFileMetadata({
      user: req.user,
      fileId: req.params.fileId,
    });

    return success(res, 200, 'Fichier charge.', file);
  } catch (err) {
    if (handleFileError(res, err)) return;
    next(err);
  }
};

exports.getPublicFileMetadata = async (req, res, next) => {
  try {
    const file = await fileService.getPublicFileMetadata({
      fileId: req.params.fileId,
    });

    return success(res, 200, 'Fichier public charge.', file);
  } catch (err) {
    if (handleFileError(res, err)) return;
    next(err);
  }
};

exports.downloadFile = async (req, res, next) => {
  try {
    const { file, target } = await fileService.getDownloadTarget({
      user: req.user,
      fileId: req.params.fileId,
    });

    if (target.mode === 'redirect') {
      return res.redirect(target.url);
    }

    res.setHeader('Content-Type', file.mimeType);
    res.setHeader(
      'Content-Disposition',
      buildContentDisposition(target.contentDisposition || 'attachment', file.originalName)
    );

    return target.stream.pipe(res);
  } catch (err) {
    if (handleFileError(res, err)) return;
    next(err);
  }
};

exports.downloadPublicFile = async (req, res, next) => {
  try {
    const { file, target } = await fileService.getPublicDownloadTarget({
      fileId: req.params.fileId,
    });

    if (target.mode === 'redirect') {
      return res.redirect(target.url);
    }

    res.setHeader('Content-Type', file.mimeType);
    res.setHeader(
      'Content-Disposition',
      buildContentDisposition(target.contentDisposition || 'inline', file.originalName)
    );

    return target.stream.pipe(res);
  } catch (err) {
    if (handleFileError(res, err)) return;
    next(err);
  }
};

exports.deleteFile = async (req, res, next) => {
  try {
    const deletedFile = await fileService.deleteFile({
      user: req.user,
      fileId: req.params.fileId,
    });

    return success(res, 200, 'Fichier supprime.', deletedFile);
  } catch (err) {
    if (handleFileError(res, err)) return;
    next(err);
  }
};
