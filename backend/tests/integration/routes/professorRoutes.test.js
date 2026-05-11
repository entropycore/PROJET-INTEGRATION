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

jest.mock('../../../src/services/professorService');
const professorService = require('../../../src/services/professorService');

const professorRouter = require('../../../src/routes/professorRoutes');
const { handleErrors } = require('../../../src/middlewares/handleErrors');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/professor', professorRouter);
app.use(handleErrors);

const makeToken = (role = 'PROFESSOR', roleId = 'professor-role-id', expiresIn = '1h') =>
  jwt.sign(
    { userId: 'professor-user-id', role, roleId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn }
  );

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Professor Routes', () => {
  it('returns 401 without an access token', async () => {
    const res = await request(app).get('/api/professor/dashboard');

    expect(res.status).toBe(401);
  });

  it('returns 403 for a non-professor role', async () => {
    const res = await request(app)
      .get('/api/professor/dashboard')
      .set('Cookie', `accessToken=${makeToken('STUDENT', 'student-role-id')}`);

    expect(res.status).toBe(403);
  });

  it('returns the professor dashboard payload', async () => {
    professorService.getProfessorDashboard.mockResolvedValue({
      profileSnapshot: { fullName: 'Pr. Mehdi Alaoui' },
      summaryCards: { pendingProjects: { value: 3 } },
    });

    const res = await request(app)
      .get('/api/professor/dashboard')
      .set('Cookie', `accessToken=${makeToken()}`);

    expect(res.status).toBe(200);
    expect(professorService.getProfessorDashboard).toHaveBeenCalledWith('professor-user-id');
    expect(res.body.data.summaryCards.pendingProjects.value).toBe(3);
  });

  it('returns the professor profile payload', async () => {
    professorService.getProfessorProfile.mockResolvedValue({
      user: { email: 'mehdi.alaoui@example.com' },
      professor: { department: 'Informatique' },
    });

    const res = await request(app)
      .get('/api/professor/profile')
      .set('Cookie', `accessToken=${makeToken()}`);

    expect(res.status).toBe(200);
    expect(professorService.getProfessorProfile).toHaveBeenCalledWith('professor-user-id');
    expect(res.body.data.professor.department).toBe('Informatique');
  });

  it('maps a missing professor profile to 404', async () => {
    professorService.getProfessorProfile.mockRejectedValue(new Error('PROFESSOR_PROFILE_NOT_FOUND'));

    const res = await request(app)
      .get('/api/professor/profile')
      .set('Cookie', `accessToken=${makeToken()}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
