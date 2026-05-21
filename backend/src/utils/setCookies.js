'use strict';

const isProduction = process.env.NODE_ENV === 'production';
const hasHttps = process.env.HTTPS === 'true'; // ← nouvelle variable

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: hasHttps,        // ← false en prod locale sans SSL
    sameSite: 'lax',         // ← lax au lieu de strict
    path: '/',
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: hasHttps,        // ← false en prod locale sans SSL
    sameSite: 'lax',         // ← lax au lieu de strict
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const setAccessTokenCookie = (res, accessToken) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: hasHttps,
    sameSite: 'lax',
    path: '/',
    maxAge: 15 * 60 * 1000,
  });
};

const clearCookies = (res) => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });
};

module.exports = { setCookies, clearCookies, setAccessTokenCookie };