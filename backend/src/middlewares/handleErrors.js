'use strict';

const logger = require('../logs/logger');

const handleErrors = (err, req, res, _next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
  });

  if (err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: 'Acces refuse - origine non autorisee',
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token invalide',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expire - veuillez vous reconnecter',
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Donnees invalides',
      errors: err.errors,
    });
  }

  return res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Erreur serveur' : err.message,
  });
};

const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} introuvable`,
  });
};

module.exports = { handleErrors, notFound };
