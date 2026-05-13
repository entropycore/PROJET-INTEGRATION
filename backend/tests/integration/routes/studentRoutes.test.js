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

jest.mock('../../../src/services/studentService');
const studentService = require('../../../src/services/studentService');

const studentRouter = require('../../../src/routes/studentRoutes');
const { handleErrors } = require('../../../src/middlewares/handleErrors');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/student', studentRouter);
app.use(handleErrors);

const makeToken = (role = 'STUDENT', roleId = 'student-role-id', expiresIn = '1h') =>
  jwt.sign(
    { userId: 'student-user-id', role, roleId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn }
  );

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Student Routes', () => {
  it('returns 401 without an access token', async () => {
    const res = await request(app).get('/api/student/dashboard');

    expect(res.status).toBe(401);
  });

  it('returns 403 for a non-student role', async () => {
    const res = await request(app)
      .get('/api/student/dashboard')
      .set('Cookie', `accessToken=${makeToken('PROFESSOR', 'professor-role-id')}`);

    expect(res.status).toBe(403);
  });

  it('returns the student dashboard payload', async () => {
    studentService.getStudentDashboard.mockResolvedValue({
      profileSnapshot: { fullName: 'Sara Alaoui' },
      summaryCards: { projects: { value: 2 } },
    });

    const res = await request(app)
      .get('/api/student/dashboard')
      .set('Cookie', `accessToken=${makeToken()}`);

    expect(res.status).toBe(200);
    expect(studentService.getStudentDashboard).toHaveBeenCalledWith('student-user-id');
    expect(res.body.data.profileSnapshot.fullName).toBe('Sara Alaoui');
  });

  it('returns the student profile payload', async () => {
    studentService.getStudentProfile.mockResolvedValue({
      user: { email: 'sara.alaoui@example.com' },
      student: { major: 'Genie Informatique' },
    });

    const res = await request(app)
      .get('/api/student/profile')
      .set('Cookie', `accessToken=${makeToken()}`);

    expect(res.status).toBe(200);
    expect(studentService.getStudentProfile).toHaveBeenCalledWith('student-user-id');
    expect(res.body.data.student.major).toBe('Genie Informatique');
  });

  it('maps a missing student profile to 404', async () => {
    studentService.getStudentProfile.mockRejectedValue(new Error('STUDENT_PROFILE_NOT_FOUND'));

    const res = await request(app)
      .get('/api/student/profile')
      .set('Cookie', `accessToken=${makeToken()}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
