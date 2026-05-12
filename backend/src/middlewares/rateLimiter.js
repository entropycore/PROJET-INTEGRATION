'use strict';

const rateLimit = require('express-rate-limit');

// Désactiver le rate limiter en mode test car il bloque les testes
const isTest = process.env.NODE_ENV === 'test';
const bypass = (req, res, next) => next();

// Limiteur général — toutes les routes
const globalLimiter = isTest ? bypass : rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Trop de requêtes, réessayez dans 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiteur strict — routes login/register
const authLimiter = isTest ? bypass : rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Trop de tentatives de connexion, réessayez dans 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiteur forgotPassword
const forgotPasswordLimiter = isTest ? bypass : rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: 'Trop de demandes de réinitialisation, réessayez dans 1 heure',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { globalLimiter, authLimiter, forgotPasswordLimiter };