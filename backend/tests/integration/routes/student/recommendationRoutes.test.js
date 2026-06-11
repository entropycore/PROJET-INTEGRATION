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

jest.mock('../../../../src/services/studentRecommendationService');
const studentRecommendationService = require('../../../../src/services/studentRecommendationService');

const recommendationRouter = require('../../../../src/routes/student/recommendationRoutes');
const authMiddleware = require('../../../../src/middlewares/authMiddleware');
const checkRoles = require('../../../../src/middlewares/checkRoles');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/student', authMiddleware, checkRoles('STUDENT'), recommendationRouter);

const makeToken = (role = 'STUDENT', roleId = 40) =>
  jwt.sign(
    { userId: 1, role, roleId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );

const studentToken = makeToken();

beforeEach(() => jest.clearAllMocks());

describe("Tests d'Intégration - Routes Recommandation Étudiant (recommendationRoutes)", () => {

  describe('Sécurité & Rôles', () => {

    it('TC-STU-REC-SEC-01 : Sans token -> 401', async () => {
      const res = await request(app).get('/api/student/recommendations');
      expect(res.status).toBe(401);
    });

    it('TC-STU-REC-SEC-02 : Professeur accède -> 403', async () => {
      const res = await request(app)
        .get('/api/student/recommendations')
        .set('Cookie', `accessToken=${makeToken('PROFESSOR')}`);
      expect(res.status).toBe(403);
    });

  });

  describe('Endpoints Logic', () => {

    it('TC-STU-REC-01 : getRecommendations -> 200', async () => {
      studentRecommendationService.listStudentRecommendations.mockResolvedValue({ items: [{ id: 'rec-1', text: 'Excellent student' }] });

      const res = await request(app)
        .get('/api/student/recommendations?page=1')
        .set('Cookie', `accessToken=${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(studentRecommendationService.listStudentRecommendations).toHaveBeenCalledWith(1, { page: '1' });
    });

    it('TC-STU-REC-02 : getRecommendationById -> 200', async () => {
      studentRecommendationService.getStudentRecommendationById.mockResolvedValue({ id: 'rec-1', text: 'Excellent' });

      const res = await request(app)
        .get('/api/student/recommendations/rec-1')
        .set('Cookie', `accessToken=${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('rec-1');
      expect(studentRecommendationService.getStudentRecommendationById).toHaveBeenCalledWith(1, 'rec-1');
    });

    it('TC-STU-REC-03 : getRecommendationById - Introuvable -> 404', async () => {
      studentRecommendationService.getStudentRecommendationById.mockRejectedValue(new Error('RECOMMENDATION_NOT_FOUND'));

      const res = await request(app)
        .get('/api/student/recommendations/rec-inexistante')
        .set('Cookie', `accessToken=${studentToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Recommandation introuvable/i);
    });

    it('TC-STU-REC-04 : updateRecommendationVisibility -> 200', async () => {
      studentRecommendationService.updateStudentRecommendationVisibility.mockResolvedValue({ id: 'rec-1', visibility: 'PUBLIC' });

      const res = await request(app)
        .patch('/api/student/recommendations/rec-1/visibility')
        .set('Cookie', `accessToken=${studentToken}`)
        .send({ visibility: 'PUBLIC' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.visibility).toBe('PUBLIC');
      expect(studentRecommendationService.updateStudentRecommendationVisibility).toHaveBeenCalledWith(1, 'rec-1', 'PUBLIC');
    });

    it('TC-STU-REC-05 : updateRecommendationVisibility - Invalide -> 400', async () => {
      studentRecommendationService.updateStudentRecommendationVisibility.mockRejectedValue(new Error('INVALID_RECOMMENDATION_VISIBILITY'));

      const res = await request(app)
        .patch('/api/student/recommendations/rec-1/visibility')
        .set('Cookie', `accessToken=${studentToken}`)
        .send({ visibility: 'INVALID' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Visibilité de recommandation invalide/i);
    });

    it('TC-STU-REC-06 : updateRecommendationStatus -> 200', async () => {
      studentRecommendationService.updateStudentRecommendationStatus.mockResolvedValue({ id: 'rec-1', status: 'ACCEPTED' });

      const res = await request(app)
        .patch('/api/student/recommendations/rec-1/status')
        .set('Cookie', `accessToken=${studentToken}`)
        .send({ status: 'ACCEPTED' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ACCEPTED');
      expect(studentRecommendationService.updateStudentRecommendationStatus).toHaveBeenCalledWith(1, 'rec-1', 'ACCEPTED');
    });

    it('TC-STU-REC-07 : updateRecommendationStatus - Invalide -> 400', async () => {
      studentRecommendationService.updateStudentRecommendationStatus.mockRejectedValue(new Error('INVALID_RECOMMENDATION_STATUS'));

      const res = await request(app)
        .patch('/api/student/recommendations/rec-1/status')
        .set('Cookie', `accessToken=${studentToken}`)
        .send({ status: 'INVALID' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Statut de recommandation invalide/i);
    });

  });

});
