'use strict';

// Forcer HTTPS en production uniquement
const redirectHttps = (req, res, next) => {
  // En développement → pas de redirection
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  // Si la requête est déjà en HTTPS → continuer
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    return next();
  }

  // Sinon → rediriger vers HTTPS
  return res.redirect(301, `https://${req.headers.host}${req.url}`);
};

module.exports = redirectHttps;
