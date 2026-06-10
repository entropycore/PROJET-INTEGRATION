'use strict';

const hasHttps = process.env.HTTPS === 'true';

// Forcer HTTPS uniquement en production ET si on a un certificat SSL
const redirectHttps = (req, res, next) => {
  //  Double sécurité : Pas de redirection en Dév, NI en Staging (Prod sans SSL)
  if (process.env.NODE_ENV !== 'production' || !hasHttps) {
    return next();
  }

  // Si la requête est déjà en HTTPS → continuer
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    return next();
  }

  // Sinon → rediriger vers HTTPS (Vrai Cloud)
  return res.redirect(301, `https://${req.headers.host}${req.url}`);
};

module.exports = redirectHttps;