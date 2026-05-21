'use strict';

const rateLimit = require('express-rate-limit');

// Disable rate limiting in tests because it interferes with automated runs.
const isTest = process.env.NODE_ENV === 'test';
const isDevelopment = process.env.NODE_ENV === 'development';
const bypass = (req, res, next) => next();

const resolveLimit = (envName, fallback) => {
  const parsed = Number.parseInt(process.env[envName] || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

// General limiter for all routes.
const globalLimiter = isTest ? bypass : rateLimit({
  windowMs: 15 * 60 * 1000,
  max: resolveLimit('GLOBAL_RATE_LIMIT_MAX', 100),
  message: {
    success: false,
    message: 'Trop de requetes, reessayez dans 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth limiter for login/register routes.
const authLimiter = isTest ? bypass : rateLimit({
  windowMs: 15 * 60 * 1000,
  max: resolveLimit('AUTH_RATE_LIMIT_MAX', isDevelopment ? 50 : 5),
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Trop de tentatives de connexion, reessayez dans 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Forgot password limiter.
const forgotPasswordLimiter = isTest ? bypass : rateLimit({
  windowMs: 60 * 60 * 1000,
  max: resolveLimit('FORGOT_PASSWORD_RATE_LIMIT_MAX', 3),
  message: {
    success: false,
    message: 'Trop de demandes de reinitialisation, reessayez dans 1 heure',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { globalLimiter, authLimiter, forgotPasswordLimiter };
