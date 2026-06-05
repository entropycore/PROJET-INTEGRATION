'use strict';

const buildContentDisposition = (type, filename) => {
  const fallback = String(filename || 'file').replace(/[^\x20-\x7E]/g, '_').replace(/["\\]/g, '_');
  const encoded = encodeURIComponent(filename || 'file');
  return `${type}; filename="${fallback}"; filename*=UTF-8''${encoded}`;
};

const sendStoredFile = (res, file, next) => {
  const target = file.target;
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
