'use strict';

const helmet = require('helmet');

const connectSrc = [
  "'self'",
  process.env.CLIENT_URL,
  process.env.S3_PUBLIC_BASE_URL,
  process.env.MINIO_PUBLIC_URL,
].filter(Boolean);

// Headers de sécurité configurés manuellement
// Plus précis que helmet() par défaut
const securityHeaders = helmet({
  // Protection XSS
  xssFilter: true,

  // Empêche le navigateur de deviner le type MIME
  noSniff: true,

  // Empêche le site d'être chargé dans une iframe
  frameguard: { action: 'deny' },

  // Force HTTPS en production
  hsts: {
    maxAge: 31536000, // 1 an
    includeSubDomains: true,
    preload: true,
  },

  // Désactive les infos sur le serveur
  hidePoweredBy: true,

  // Contrôle ce que le navigateur peut charger
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc,
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
});

module.exports = securityHeaders;
