'use strict';

const fs = require('fs');

const buildContentDisposition = (type, filename) => {
  const fallback = String(filename || 'file').replace(/[^\x20-\x7E]/g, '_').replace(/["\\]/g, '_');
  const encoded = encodeURIComponent(filename || 'file');
  return `${type}; filename="${fallback}"; filename*=UTF-8''${encoded}`;
};

const getTarget = (file) => {
  if (typeof file.target === 'string') {
    return {
      contentDisposition: file.contentDisposition,
      stream: fs.createReadStream(file.target),
    };
  }

  if (file.target) return file.target;

  if (file.absolutePath) {
    return {
      contentDisposition: file.contentDisposition,
      stream: fs.createReadStream(file.absolutePath),
    };
  }

  throw new Error('FILE_TARGET_NOT_FOUND');
};

const sendStoredFile = (res, file, next) => {
  const target = getTarget(file);
  const resourcePolicy = file.crossOriginResourcePolicy || 'cross-origin';

  if (target.mode === 'redirect') {
    res.setHeader('Cross-Origin-Resource-Policy', resourcePolicy);
    return res.redirect(target.url);
  }

  const disposition = target.contentDisposition || 'attachment';
  res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
  res.setHeader('Content-Disposition', buildContentDisposition(disposition, file.downloadName));
  res.setHeader('Cross-Origin-Resource-Policy', resourcePolicy);

  target.stream.on('error', next);
  return target.stream.pipe(res);
};

module.exports = sendStoredFile;
