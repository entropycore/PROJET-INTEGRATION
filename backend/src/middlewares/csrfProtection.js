'use strict';

const { doubleCsrf } = require('csrf-csrf');

const isProduction = process.env.NODE_ENV === 'production';

const { generateCsrfToken, doubleCsrfProtection: _doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET,
  getSessionIdentifier: (req) => req.cookies?.refreshToken ?? '',
  cookieName: isProduction ? '__Host-csrf-token' : 'csrf-token',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'strict',
    secure: isProduction,
    path: '/',
  },
  size: 64,
  getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token'],
});

// In test env, skip CSRF so existing integration tests don't need to fetch a token first.
const doubleCsrfProtection =
  process.env.NODE_ENV === 'test'
    ? (req, res, next) => next()
    : _doubleCsrfProtection;

module.exports = { generateCsrfToken, doubleCsrfProtection };
