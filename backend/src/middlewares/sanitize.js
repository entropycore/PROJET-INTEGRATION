'use strict';

const xss = require('xss');

// Applique xss() récursivement sur toutes les chaînes d'un objet/tableau
const sanitizeValue = (value) => {
  if (typeof value === 'string') return xss(value.trim());
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value !== null && typeof value === 'object') {
    const sanitized = {};
    for (const key of Object.keys(value)) {
      sanitized[key] = sanitizeValue(value[key]);
    }
    return sanitized;
  }
  return value;
};

const sanitizeInputs = (req, res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  next();
};

module.exports = { sanitizeInputs };
