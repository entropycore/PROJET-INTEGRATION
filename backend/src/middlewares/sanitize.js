'use strict';

const SENSITIVE_FIELDS = new Set([
  'password',
  'newPassword',
  'currentPassword',
  'confirmPassword',
  'token',
  'accessToken',
  'refreshToken',
]);

const trimObjectStrings = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return;
  }

  Object.keys(value).forEach((key) => {
    if (SENSITIVE_FIELDS.has(key)) {
      return;
    }

    if (typeof value[key] === 'string') {
      value[key] = value[key].trim();
      return;
    }

    trimObjectStrings(value[key]);
  });
};

// Middleware trim des inputs non sensibles.
const sanitizeInputs = (req, res, next) => {
  trimObjectStrings(req.body);
  next();
};

module.exports = { sanitizeInputs };
