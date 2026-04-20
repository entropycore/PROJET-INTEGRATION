'use strict';

const jwt = require('jsonwebtoken');

// Générer l'access token — courte durée (15min)
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '15m',
  });
};

// Générer le refresh token — longue durée (7j)
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES || '7d',
  });
};

module.exports = { generateAccessToken, generateRefreshToken };
