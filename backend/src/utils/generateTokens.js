'use strict';

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Generate the access token with a short lifetime.
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '15m',
  });
};

// Generate the refresh token with a unique session identifier.
const generateRefreshToken = (payload) => {
  return jwt.sign(
    {
      ...payload,
      sessionId: crypto.randomUUID(),
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES || '7d',
    }
  );
};

module.exports = { generateAccessToken, generateRefreshToken };
