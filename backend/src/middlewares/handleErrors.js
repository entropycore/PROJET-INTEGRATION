'use strict';

const logger = require('../logs/logger');

// Middleware gestion erreurs globale
const handleErrors = (err, req, res, _next) => {
  // Logger l'erreur complète dans les fichiers logs
  logger.error({
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
  });

  // Erreur CORS
  if (err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: 'Accès refusé — origine non autorisée',
    });
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token invalide',
    });
  }

  // Erreur token expiré
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expiré — veuillez vous reconnecter',
    });
  }

  // Erreur validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Données invalides',
      errors: err.errors,
    });
  }

  // Erreur serveur générique — jamais révéler les détails
  return res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production' ? 'Erreur serveur' : err.message,
  });
};

// Middleware route introuvable — 404
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} introuvable`,
  });
};

module.exports = { handleErrors, notFound };
