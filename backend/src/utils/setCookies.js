'use strict';

const isProduction = process.env.NODE_ENV === 'production';

const parseBoolean = (value, fallback) => {
  if (value === undefined || value === null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

const cookieOptions = {
  httpOnly: true,
  secure: parseBoolean(process.env.COOKIE_SECURE, isProduction),
  sameSite: process.env.COOKIE_SAME_SITE || 'strict',
  path: '/',
};

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const setAccessTokenCookie = (res, accessToken) => {
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });
};

const clearCookies = (res) => {
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
};

module.exports = { setCookies, clearCookies, setAccessTokenCookie };
