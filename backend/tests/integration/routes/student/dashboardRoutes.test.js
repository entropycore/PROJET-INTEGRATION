'use strict';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const express = require('express');
const cookieParser = require('cookie-parser');

process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'test-access-secret';

jest.mock('../../../../src/logs/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

jest.mock('../../../../src/services/student/dashboardService');
const studentDashboardService = require('../../../../src/services/student/dashboardService');

const dashboardRouter = require('../../../../src/routes/student/dashboardRoutes');
const authMiddleware = require('../../../../src/middlewares/authMiddleware');
const checkRoles = require('../../../../src/middlewares/checkRoles');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/student', authMiddleware, checkRoles('STUDENT'), dashboardRouter);

const makeToken = (role = 'STUDENT', roleId = 40) =>
  jwt.sign(
    { userId: 1, role, roleId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );

const studentToken = makeToken();

beforeEach(() => jest.clearAllMocks());

describe("Tests d'Intégration - Routes Dashboard Étudiant (dashboardRoutes)", () => {

  describe('Sécurité & Rôles', () => {

    it('TC-STU-DASH-SEC-01 : Sans token -> 401', async () => {
      const res = await request(app).get('/api/student/dashboard');
      expect(res.status).toBe(401);
    });

    it('TC-STU-DASH-SEC-02 : Professeur accède -> 403', async () => {
      const res = await request(app)
        .get('/api/student/dashboard')
        .set('Cookie', `accessToken=${makeToken('PROFESSOR')}`);
      expect(res.status).toBe(403);
    });

  });

  describe('Endpoints Logic', () => {

    it('TC-STU-DASH-01 : getDashboard -> 200', async () => {
      studentDashboardService.getStudentDashboard.mockResolvedValue({ area: 'student', user: { id: 1 } });

      const res = await request(app)
        .get('/api/student/dashboard')
        .set('Cookie', `accessToken=${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.area).toBe('student');
      expect(studentDashboardService.getStudentDashboard).toHaveBeenCalledWith(1);
    });

    it('TC-STU-DASH-02 : getCredibilityScore -> 200', async () => {
      studentDashboardService.getStudentCredibilityScore.mockResolvedValue({ score: 85 });

      const res = await request(app)
        .get('/api/student/credibility-score')
        .set('Cookie', `accessToken=${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.score).toBe(85);
      expect(studentDashboardService.getStudentCredibilityScore).toHaveBeenCalledWith(1);
    });

    it('TC-STU-DASH-03 : getCredibilityScoreDetails -> 200', async () => {
      studentDashboardService.getStudentCredibilityScoreDetails.mockResolvedValue({ details: [] });

      const res = await request(app)
        .get('/api/student/credibility-score/details')
        .set('Cookie', `accessToken=${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(studentDashboardService.getStudentCredibilityScoreDetails).toHaveBeenCalledWith(1);
    });

    it('TC-STU-DASH-04 : getProfileCompletion -> 200', async () => {
      studentDashboardService.getStudentProfileCompletion.mockResolvedValue({ percentage: 70 });

      const res = await request(app)
        .get('/api/student/profile-completion')
        .set('Cookie', `accessToken=${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.percentage).toBe(70);
      expect(studentDashboardService.getStudentProfileCompletion).toHaveBeenCalledWith(1);
    });

    it('TC-STU-DASH-05 : getTimeline -> 200', async () => {
      studentDashboardService.getStudentTimeline.mockResolvedValue({ timeline: [] });

      const res = await request(app)
        .get('/api/student/timeline')
        .set('Cookie', `accessToken=${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(studentDashboardService.getStudentTimeline).toHaveBeenCalledWith(1);
    });

    it('TC-STU-DASH-06 : getBadges -> 200', async () => {
      studentDashboardService.getStudentBadges.mockResolvedValue({ badges: [] });

      const res = await request(app)
        .get('/api/student/badges')
        .set('Cookie', `accessToken=${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(studentDashboardService.getStudentBadges).toHaveBeenCalledWith(1);
    });

  });

});
