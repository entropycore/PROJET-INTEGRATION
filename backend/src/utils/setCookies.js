'use strict';

const isProduction = process.env.NODE_ENV === 'production';

// Configurer et envoyer les deux cookies
const setCookies = (res, accessToken, refreshToken) => {
  // Cookie access token — 15 minutes
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/',
    maxAge: 15 * 60 * 1000,
  });

  // Cookie refresh token — 7 jours
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const setAccessTokenCookie = (res, accessToken) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/',
    maxAge: 15 * 60 * 1000,
  });
};

// Effacer les deux cookies au logout
const clearCookies = (res) => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
  });
};

module.exports = { setCookies, clearCookies ,setAccessTokenCookie};
