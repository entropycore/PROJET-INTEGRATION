'use strict';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const express = require('express');
const cookieParser = require('cookie-parser');

process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'test-access-secret';

jest.mock('../../../src/logs/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

jest.mock('../../../src/services/professionalService');
const professionalService = require('../../../src/services/professionalService');

const professionalRouter = require('../../../src/routes/professionalRoutes');
const { handleErrors } = require('../../../src/middlewares/handleErrors');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/professional', professionalRouter);
app.use(handleErrors);

const makeToken = (role = 'PROFESSIONAL', roleId = 'professional-role-id', expiresIn = '1h') =>
  jwt.sign(
    { userId: 'professional-user-id', role, roleId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn }
  );

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Professional Routes', () => {
  it('returns 401 without an access token', async () => {
    const res = await request(app).get('/api/professional/dashboard');

    expect(res.status).toBe(401);
  });

  it('returns 403 for a non-professional role', async () => {
    const res = await request(app)
      .get('/api/professional/dashboard')
      .set('Cookie', `accessToken=${makeToken('STUDENT', 'student-role-id')}`);

    expect(res.status).toBe(403);
  });

  it('returns the professional dashboard payload', async () => {
    professionalService.getProfessionalDashboard.mockResolvedValue({
      profileSnapshot: { fullName: 'Yassine Benali' },
      summaryCards: { emailVerified: { value: true } },
    });

    const res = await request(app)
      .get('/api/professional/dashboard')
      .set('Cookie', `accessToken=${makeToken()}`);

    expect(res.status).toBe(200);
    expect(professionalService.getProfessionalDashboard).toHaveBeenCalledWith(
      'professional-user-id'
    );
    expect(res.body.data.profileSnapshot.fullName).toBe('Yassine Benali');
  });

  it('returns the professional profile payload', async () => {
    professionalService.getProfessionalProfile.mockResolvedValue({
      user: { email: 'yassine.benali@example.com' },
      professional: { company: 'Credencia' },
    });

    const res = await request(app)
      .get('/api/professional/profile')
      .set('Cookie', `accessToken=${makeToken()}`);

    expect(res.status).toBe(200);
    expect(professionalService.getProfessionalProfile).toHaveBeenCalledWith(
      'professional-user-id'
    );
    expect(res.body.data.professional.company).toBe('Credencia');
  });

  it('maps a missing professional profile to 404', async () => {
    professionalService.getProfessionalProfile.mockRejectedValue(
      new Error('PROFESSIONAL_PROFILE_NOT_FOUND')
    );

    const res = await request(app)
      .get('/api/professional/profile')
      .set('Cookie', `accessToken=${makeToken()}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
