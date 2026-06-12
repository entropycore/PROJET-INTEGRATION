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

jest.mock('../../../src/services/studentRecommendationService');
jest.mock('../../../src/services/reportService');

const studentRecommendationService = require('../../../src/services/studentRecommendationService');
const reportService = require('../../../src/services/reportService');

const recommendationRouter = require('../../../src/routes/recommendationRoutes');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/recommendations', recommendationRouter);

const makeToken = (role = 'STUDENT', roleId = 40) =>
  jwt.sign(
    { userId: 'user-123', role, roleId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );

const userToken = makeToken();

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Tests d'Intégration - Routes Recommandation Globale (recommendationRoutes)", () => {

  describe('Sécurité & Authentification', () => {

    it('TC-REC-SEC-01 : Sans token -> 401', async () => {
      const res = await request(app).get('/api/recommendations/rec-123');
      expect(res.status).toBe(401);
    });

  });

  describe('Endpoints Logic', () => {

    it('TC-REC-01 : getRecommendationById -> 200', async () => {
      const mockRecommendation = { id: 'rec-123', text: 'Highly recommended', status: 'ACCEPTED' };
      studentRecommendationService.getStudentRecommendationById.mockResolvedValue(mockRecommendation);

      const res = await request(app)
        .get('/api/recommendations/rec-123')
        .set('Cookie', `accessToken=${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockRecommendation);
      expect(studentRecommendationService.getStudentRecommendationById).toHaveBeenCalledWith(
        'user-123',
        'rec-123'
      );
    });

    it('TC-REC-02 : getRecommendationById - Introuvable -> 404', async () => {
      studentRecommendationService.getStudentRecommendationById.mockRejectedValue(
        new Error('RECOMMENDATION_NOT_FOUND')
      );

      const res = await request(app)
        .get('/api/recommendations/rec-123')
        .set('Cookie', `accessToken=${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Recommandation introuvable/i);
    });

    it('TC-REC-03 : reportRecommendation -> 201', async () => {
      const mockReport = { id: 'report-456', reporterUserId: 'user-123', targetType: 'RECOMMENDATION', targetId: 'rec-123' };
      
      studentRecommendationService.getStudentRecommendationById.mockResolvedValue({});
      reportService.createReport.mockResolvedValue(mockReport);

      const res = await request(app)
        .post('/api/recommendations/rec-123/report')
        .set('Cookie', `accessToken=${userToken}`)
        .send({ reason: 'Contenu inapproprié', description: 'Langage agressif' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockReport);
      expect(reportService.createReport).toHaveBeenCalledWith({
        reporterUserId: 'user-123',
        targetType: 'RECOMMENDATION',
        targetId: 'rec-123',
        reason: 'Contenu inapproprié',
        description: 'Langage agressif'
      });
    });

    it('TC-REC-04 : reportRecommendation - Doublon -> 409', async () => {
      studentRecommendationService.getStudentRecommendationById.mockResolvedValue({});
      reportService.createReport.mockRejectedValue(new Error('REPORT_ALREADY_EXISTS'));

      const res = await request(app)
        .post('/api/recommendations/rec-123/report')
        .set('Cookie', `accessToken=${userToken}`)
        .send({ reason: 'Contenu inapproprié' });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/signalement en attente existe déjà/i);
    });

  });

});
