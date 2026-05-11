'use strict';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const express = require('express');
const cookieParser = require('cookie-parser');

process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'test-access-secret';
process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'test-refresh-secret';

jest.mock('../../../src/logs/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

jest.mock('../../../src/services/authService');
const authService = require('../../../src/services/authService');

const authRouter = require('../../../src/routes/authRoutes');
const { handleErrors } = require('../../../src/middlewares/handleErrors');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRouter);
app.use(handleErrors);

const hasCookie = (res, name) =>
  (res.headers['set-cookie'] || []).some((cookie) => cookie.startsWith(`${name}=`));

const isCookieCleared = (res, name) =>
  (res.headers['set-cookie'] || []).some(
    (cookie) => cookie.startsWith(`${name}=`) && cookie.includes('Expires=Thu, 01 Jan 1970')
  );

const makeAccessToken = (payload = {}, expiresIn = '1h') =>
  jwt.sign(
    {
      userId: 'user-1',
      role: 'PROFESSIONAL',
      roleId: 'professional-1',
      ...payload,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn }
  );

const makeRefreshToken = (payload = {}, expiresIn = '7d') =>
  jwt.sign(
    {
      userId: 'user-1',
      ...payload,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn }
  );

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('creates a professional access request', async () => {
      authService.registerProfessional.mockResolvedValue({ id: 'user-1' });

      const res = await request(app).post('/api/auth/register').send({
        lastName: 'Alaoui',
        firstName: 'Sara',
        email: 'sara.alaoui@example.com',
        password: 'Test@1234',
        company: 'Credencia',
        jobTitle: 'Backend Engineer',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(authService.registerProfessional).toHaveBeenCalledWith({
        lastName: 'Alaoui',
        firstName: 'Sara',
        email: 'sara.alaoui@example.com',
        password: 'Test@1234',
        company: 'Credencia',
        jobTitle: 'Backend Engineer',
      });
    });

    it('returns 409 when the email already exists', async () => {
      authService.registerProfessional.mockRejectedValue(new Error('EMAIL_ALREADY_EXISTS'));

      const res = await request(app).post('/api/auth/register').send({
        lastName: 'Alaoui',
        firstName: 'Sara',
        email: 'sara.alaoui@example.com',
        password: 'Test@1234',
        company: 'Credencia',
        jobTitle: 'Backend Engineer',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('returns 400 when company or job title is missing', async () => {
      const res = await request(app).post('/api/auth/register').send({
        lastName: 'Alaoui',
        firstName: 'Sara',
        email: 'sara.alaoui@example.com',
        password: 'Test@1234',
        company: '',
        jobTitle: '',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'company' }),
          expect.objectContaining({ field: 'jobTitle' }),
        ])
      );
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('returns 200 for a valid email payload', async () => {
      authService.requestPasswordReset.mockResolvedValue(true);

      const res = await request(app).post('/api/auth/forgot-password').send({
        email: 'sara.alaoui@example.com',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(authService.requestPasswordReset).toHaveBeenCalledWith('sara.alaoui@example.com');
    });

    it('returns 500 when email sending fails', async () => {
      authService.requestPasswordReset.mockRejectedValue(new Error('EMAIL_SEND_FAILED'));

      const res = await request(app).post('/api/auth/forgot-password').send({
        email: 'sara.alaoui@example.com',
      });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('resets the password when the token is valid', async () => {
      authService.resetPassword.mockResolvedValue(true);

      const res = await request(app).post('/api/auth/reset-password').send({
        token: 'reset-token',
        newPassword: 'Reset@1234',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(authService.resetPassword).toHaveBeenCalledWith('reset-token', 'Reset@1234');
    });

    it('returns 400 when the reset token is invalid', async () => {
      authService.resetPassword.mockRejectedValue(new Error('INVALID_RESET_TOKEN'));

      const res = await request(app).post('/api/auth/reset-password').send({
        token: 'invalid-token',
        newPassword: 'Reset@1234',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('sets both auth cookies on successful login', async () => {
      authService.loginUser.mockResolvedValue({
        role: 'PROFESSIONAL',
        accessToken: 'access-token-value',
        refreshToken: 'refresh-token-value',
      });

      const res = await request(app).post('/api/auth/login').send({
        email: 'sara.alaoui@example.com',
        password: 'Test@1234',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.role).toBe('PROFESSIONAL');
      expect(hasCookie(res, 'accessToken')).toBe(true);
      expect(hasCookie(res, 'refreshToken')).toBe(true);
    });

    it('returns 401 on invalid credentials', async () => {
      authService.loginUser.mockRejectedValue(new Error('INVALID_CREDENTIALS'));

      const res = await request(app).post('/api/auth/login').send({
        email: 'sara.alaoui@example.com',
        password: 'Wrong@1234',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('returns 403 when the email is not verified', async () => {
      authService.loginUser.mockRejectedValue(new Error('EMAIL_NOT_VERIFIED'));

      const res = await request(app).post('/api/auth/login').send({
        email: 'sara.alaoui@example.com',
        password: 'Test@1234',
      });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns the current user profile for a valid access token', async () => {
      authService.getUserById.mockResolvedValue({
        id: 'user-1',
        email: 'sara.alaoui@example.com',
        role: 'PROFESSIONAL',
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', `accessToken=${makeAccessToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(authService.getUserById).toHaveBeenCalledWith('user-1');
    });

    it('returns 401 when the access token is missing', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    it('returns a new access token for a valid refresh token', async () => {
      authService.refreshUserToken.mockResolvedValue('new-access-token');

      const res = await request(app)
        .post('/api/auth/refresh-token')
        .set('Cookie', `refreshToken=${makeRefreshToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(authService.refreshUserToken).toHaveBeenCalledWith(
        'user-1',
        expect.any(String)
      );
      expect(hasCookie(res, 'accessToken')).toBe(true);
    });

    it('returns 401 when the refresh token cookie is missing', async () => {
      const res = await request(app).post('/api/auth/refresh-token');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('returns 401 when the refresh token is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/refresh-token')
        .set('Cookie', 'refreshToken=invalid.token.value');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('clears cookies even when no refresh token is provided', async () => {
      const res = await request(app).post('/api/auth/logout');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(isCookieCleared(res, 'accessToken')).toBe(true);
      expect(isCookieCleared(res, 'refreshToken')).toBe(true);
      expect(authService.revokeToken).not.toHaveBeenCalled();
    });

    it('ignores invalid refresh tokens and still clears cookies', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', 'refreshToken=invalid.token.value');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(isCookieCleared(res, 'accessToken')).toBe(true);
      expect(isCookieCleared(res, 'refreshToken')).toBe(true);
      expect(authService.revokeToken).not.toHaveBeenCalled();
    });

    it('revokes the refresh token when it is valid', async () => {
      authService.revokeToken.mockResolvedValue({ id: 'session-1' });

      const refreshToken = makeRefreshToken();
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', `refreshToken=${refreshToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(authService.revokeToken).toHaveBeenCalledWith('user-1', refreshToken);
    });
  });
});
