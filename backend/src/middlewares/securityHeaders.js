'use strict';

const helmet = require('helmet');

// Variable pour vérifier si on utilise un vrai certificat SSL (NOUVEAU)
const hasHttps = process.env.HTTPS === 'true';

// Headers de sécurité configurés manuellement
// Plus précis que helmet() par défaut
const securityHeaders = helmet({
  // Protection XSS
  xssFilter: true,

  // Empêche le navigateur de deviner le type MIME
  noSniff: true,

  // Empêche le site d'être chargé dans une iframe
  frameguard: { action: 'deny' },

  // Force HTTPS (HSTS)
  // Modifié : Activé uniquement si HTTPS=true dans le .env pour ne pas bloquer le réseau local
  hsts: hasHttps ? {
    maxAge: 31536000, // 1 an
    includeSubDomains: true,
    preload: true,
  } : false, // ← Désactivé en local/staging sans SSL

  // Désactive les infos sur le serveur
  hidePoweredBy: true,

  // Contrôle ce que le navigateur peut charger (CSP)
  // Modifié : Activé uniquement en prod/HTTPS pour éviter de bloquer les scripts Vue.js en staging
  contentSecurityPolicy: hasHttps ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'", process.env.CLIENT_URL],
      fontSrc: ["'self'"],
      frameSrc: ["'self'", 'blob:'],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  } : false, // ← Désactivé en local/staging pour la souplesse de développement
});

module.exports = securityHeaders;