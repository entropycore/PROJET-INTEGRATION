'use strict';

const crypto = require('crypto');

// Hash un refresh token avec SHA256
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = { hashToken };
