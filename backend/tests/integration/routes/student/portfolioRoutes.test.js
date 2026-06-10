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

jest.mock('../../../../src/services/studentPortfolioService');
const studentPortfolioService = require('../../../../src/services/studentPortfolioService');

const portfolioRouter = require('../../../../src/routes/student/portfolioRoutes');
const authMiddleware = require('../../../../src/middlewares/authMiddleware');
const checkRoles = require('../../../../src/middlewares/checkRoles');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/student', authMiddleware, checkRoles('STUDENT'), portfolioRouter);

const makeToken = (role = 'STUDENT', roleId = 40) =>
  jwt.sign(
    { userId: 1, role, roleId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );

const studentToken = makeToken();

beforeEach(() => jest.clearAllMocks());

describe("Tests d'Intégration - Routes Portfolio Étudiant (portfolioRoutes)", () => {

  describe('Sécurité & Rôles', () => {

    it('TC-STU-PORT-SEC-01 : Sans token -> 401', async () => {
      const res = await request(app).get('/api/student/portfolio/preview');
      expect(res.status).toBe(401);
    });

    it('TC-STU-PORT-SEC-02 : Professeur accède -> 403', async () => {
      const res = await request(app)
        .get('/api/student/portfolio/preview')
        .set('Cookie', `accessToken=${makeToken('PROFESSOR')}`);
      expect(res.status).toBe(403);
    });

  });

  describe('Endpoints Logic', () => {

    it('TC-STU-PORT-01 : getPreview -> 200', async () => {
      studentPortfolioService.getStudentPortfolioPreview.mockResolvedValue({ id: 'portfolio-1', theme: 'classic' });

      const res = await request(app)
        .get('/api/student/portfolio/preview')
        .set('Cookie', `accessToken=${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.theme).toBe('classic');
      expect(studentPortfolioService.getStudentPortfolioPreview).toHaveBeenCalledWith(1);
    });

    it('TC-STU-PORT-02 : getPreview - Profil non trouvé -> 404', async () => {
      studentPortfolioService.getStudentPortfolioPreview.mockRejectedValue(new Error('STUDENT_PROFILE_NOT_FOUND'));

      const res = await request(app)
        .get('/api/student/portfolio/preview')
        .set('Cookie', `accessToken=${studentToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Profil étudiant introuvable/i);
    });

    it('TC-STU-PORT-03 : generatePortfolio -> 201', async () => {
      studentPortfolioService.generateStudentPortfolio.mockResolvedValue({ id: 'portfolio-1', theme: 'modern' });

      const res = await request(app)
        .post('/api/student/portfolio/generate')
        .set('Cookie', `accessToken=${studentToken}`)
        .send({ theme: 'modern' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.theme).toBe('modern');
      expect(studentPortfolioService.generateStudentPortfolio).toHaveBeenCalledWith(1, { theme: 'modern' });
    });

    it('TC-STU-PORT-04 : generatePortfolio - Thème invalide -> 400', async () => {
      studentPortfolioService.generateStudentPortfolio.mockRejectedValue(new Error('INVALID_PORTFOLIO_THEME'));

      const res = await request(app)
        .post('/api/student/portfolio/generate')
        .set('Cookie', `accessToken=${studentToken}`)
        .send({ theme: 'invalide' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Thème portfolio invalide/i);
    });

  });

});
