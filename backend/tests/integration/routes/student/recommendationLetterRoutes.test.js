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

jest.mock('../../../../src/services/studentRecommendationLetterService');
const studentRecommendationLetterService = require('../../../../src/services/studentRecommendationLetterService');

const recommendationLetterRouter = require('../../../../src/routes/student/recommendationLetterRoutes');
const authMiddleware = require('../../../../src/middlewares/authMiddleware');
const checkRoles = require('../../../../src/middlewares/checkRoles');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/student', authMiddleware, checkRoles('STUDENT'), recommendationLetterRouter);

const makeToken = (role = 'STUDENT', roleId = 40) =>
  jwt.sign(
    { userId: 1, role, roleId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );

const studentToken = makeToken();

beforeEach(() => jest.clearAllMocks());

describe("Tests d'Intégration - Routes Lettres de Recommandation Étudiant (recommendationLetterRoutes)", () => {

  describe('Sécurité & Rôles', () => {

    it('TC-STU-RECLET-SEC-01 : Sans token -> 401', async () => {
      const res = await request(app).get('/api/student/recommendation-letters');
      expect(res.status).toBe(401);
    });

    it('TC-STU-RECLET-SEC-02 : Professeur accède -> 403', async () => {
      const res = await request(app)
        .get('/api/student/recommendation-letters')
        .set('Cookie', `accessToken=${makeToken('PROFESSOR')}`);
      expect(res.status).toBe(403);
    });

  });

  describe('Endpoints Logic', () => {

    it('TC-STU-RECLET-01 : getRecommendationLetters -> 200', async () => {
      const mockResult = {
        stats: { received: 1, pending: 0, rejected: 0 },
        recommendationLetters: [{ id: 'l-1', title: 'Lettre recommandée', status: 'RECEIVED' }],
      };
      studentRecommendationLetterService.listStudentRecommendationLetters.mockResolvedValue(mockResult);

      const res = await request(app)
        .get('/api/student/recommendation-letters?status=ALL')
        .set('Cookie', `accessToken=${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.recommendationLetters).toHaveLength(1);
      expect(studentRecommendationLetterService.listStudentRecommendationLetters).toHaveBeenCalledWith(1, { status: 'ALL' });
    });

    it('TC-STU-RECLET-02 : getRecommendationLetterById -> 200', async () => {
      const mockLetter = { id: 'l-1', title: 'Lettre recommandée', status: 'RECEIVED' };
      studentRecommendationLetterService.getStudentRecommendationLetterById.mockResolvedValue(mockLetter);

      const res = await request(app)
        .get('/api/student/recommendation-letters/l-1')
        .set('Cookie', `accessToken=${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('l-1');
      expect(studentRecommendationLetterService.getStudentRecommendationLetterById).toHaveBeenCalledWith(1, 'l-1');
    });

    it('TC-STU-RECLET-03 : getRecommendationLetterById introuvable -> 404', async () => {
      studentRecommendationLetterService.getStudentRecommendationLetterById.mockRejectedValue(new Error('RECOMMENDATION_LETTER_NOT_FOUND'));

      const res = await request(app)
        .get('/api/student/recommendation-letters/l-unknown')
        .set('Cookie', `accessToken=${studentToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('introuvable');
    });

    it('TC-STU-RECLET-04 : updateRecommendationLetterVisibility -> 200', async () => {
      const mockLetter = { id: 'l-1', visibility: 'PUBLIC' };
      studentRecommendationLetterService.updateStudentRecommendationLetterVisibility.mockResolvedValue(mockLetter);

      const res = await request(app)
        .patch('/api/student/recommendation-letters/l-1/visibility')
        .set('Cookie', `accessToken=${studentToken}`)
        .send({ visibility: 'PUBLIC' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.visibility).toBe('PUBLIC');
      expect(studentRecommendationLetterService.updateStudentRecommendationLetterVisibility).toHaveBeenCalledWith(1, 'l-1', 'PUBLIC');
    });

    it('TC-STU-RECLET-05 : updateRecommendationLetterVisibility invalide -> 400', async () => {
      studentRecommendationLetterService.updateStudentRecommendationLetterVisibility.mockRejectedValue(new Error('INVALID_RECOMMENDATION_LETTER_VISIBILITY'));

      const res = await request(app)
        .patch('/api/student/recommendation-letters/l-1/visibility')
        .set('Cookie', `accessToken=${studentToken}`)
        .send({ visibility: 'INVALID_VAL' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Visibilite');
    });

    it('TC-STU-RECLET-06 : updateRecommendationLetterDownloadable -> 200', async () => {
      const mockLetter = { id: 'l-1', downloadable: true };
      studentRecommendationLetterService.updateStudentRecommendationLetterDownloadable.mockResolvedValue(mockLetter);

      const res = await request(app)
        .patch('/api/student/recommendation-letters/l-1/downloadable')
        .set('Cookie', `accessToken=${studentToken}`)
        .send({ downloadable: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.downloadable).toBe(true);
      expect(studentRecommendationLetterService.updateStudentRecommendationLetterDownloadable).toHaveBeenCalledWith(1, 'l-1', true);
    });

    it('TC-STU-RECLET-07 : updateRecommendationLetterDownloadable invalide -> 400', async () => {
      studentRecommendationLetterService.updateStudentRecommendationLetterDownloadable.mockRejectedValue(new Error('INVALID_RECOMMENDATION_LETTER_DOWNLOADABLE'));

      const res = await request(app)
        .patch('/api/student/recommendation-letters/l-1/downloadable')
        .set('Cookie', `accessToken=${studentToken}`)
        .send({ downloadable: 'not-a-boolean' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Option telechargeable');
    });

  });

});
