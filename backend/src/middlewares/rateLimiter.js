'use strict';

const rateLimit = require('express-rate-limit');

// Disable the rate limiter in tests to avoid blocking repeated requests.
const isTest = process.env.NODE_ENV === 'test';
const bypass = (req, res, next) => next();

const globalLimiter = isTest
  ? bypass
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: {
        success: false,
        message: 'Trop de requetes, reessayez dans 15 minutes',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

const authLimiter = isTest
  ? bypass
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: {
        success: false,
        message: 'Trop de tentatives de connexion, reessayez dans 15 minutes',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

const forgotPasswordLimiter = isTest
  ? bypass
  : rateLimit({
      windowMs: 60 * 60 * 1000,
      max: 3,
      message: {
        success: false,
        message: 'Trop de demandes de reinitialisation, reessayez dans 1 heure',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

module.exports = { globalLimiter, authLimiter, forgotPasswordLimiter };
