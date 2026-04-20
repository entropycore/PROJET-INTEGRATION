'use strict';

const rateLimit = require('express-rate-limit');

// Limiteur général — toutes les routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes max
  message: {
    success: false,
    message: 'Trop de requêtes, réessayez dans 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiteur strict — routes login/register
// Protection contre brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives max
  message: {
    success: false,
    message: 'Trop de tentatives de connexion, réessayez dans 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiteur forgotPassword
// Évite le spam d'emails
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3, // 3 demandes max par heure
  message: {
    success: false,
    message: 'Trop de demandes de réinitialisation, réessayez dans 1 heure',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { globalLimiter, authLimiter, forgotPasswordLimiter };
