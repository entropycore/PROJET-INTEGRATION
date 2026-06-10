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

jest.mock('../../../src/services/reportService');
const reportService = require('../../../src/services/reportService');

const reportRouter = require('../../../src/routes/reportRoutes');
const authMiddleware = require('../../../src/middlewares/authMiddleware');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/reports', authMiddleware, reportRouter);

const makeToken = (role = 'STUDENT', roleId = 40) =>
  jwt.sign(
    { userId: 1, role, roleId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );

const userToken = makeToken();

beforeEach(() => jest.clearAllMocks());

describe("Tests d'Intégration - Routes Reports (reportRoutes)", () => {

  describe('Sécurité', () => {

    it('TC-REP-SEC-01 : Sans token -> 401', async () => {
      const res = await request(app).post('/api/reports').send({
        targetType: 'PORTFOLIO',
        targetId: 'p-1',
        reason: 'Contenu inapproprié',
      });
      expect(res.status).toBe(401);
    });

  });

  describe('Endpoints Logic', () => {

    it('TC-REP-01 : createReport valide -> 201', async () => {
      const mockReport = {
        id: 'r-1',
        reporterUserId: 1,
        targetType: 'PORTFOLIO',
        targetId: 'p-1',
        reason: 'Contenu inapproprié',
        status: 'PENDING',
      };
      reportService.createReport.mockResolvedValue(mockReport);

      const res = await request(app)
        .post('/api/reports')
        .set('Cookie', `accessToken=${userToken}`)
        .send({
          targetType: 'PORTFOLIO',
          targetId: 'p-1',
          reason: 'Contenu inapproprié',
          description: 'Lien invalide ou injurieux.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('r-1');
      expect(reportService.createReport).toHaveBeenCalledWith({
        reporterUserId: 1,
        targetType: 'PORTFOLIO',
        targetId: 'p-1',
        reason: 'Contenu inapproprié',
        description: 'Lien invalide ou injurieux.',
      });
    });

    it('TC-REP-02 : Validation échouée (champs manquants) -> 400', async () => {
      const res = await request(app)
        .post('/api/reports')
        .set('Cookie', `accessToken=${userToken}`)
        .send({
          targetType: '',
          reason: 'A',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Données invalides');
    });

    it('TC-REP-03 : createReport type cible invalide -> 400', async () => {
      reportService.createReport.mockRejectedValue(new Error('INVALID_REPORT_TARGET_TYPE'));

      const res = await request(app)
        .post('/api/reports')
        .set('Cookie', `accessToken=${userToken}`)
        .send({
          targetType: 'PORTFOLIO',
          targetId: 'p-1',
          reason: 'Contenu inapproprié',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('type de cible');
    });

    it('TC-REP-04 : createReport id cible manquant -> 400', async () => {
      reportService.createReport.mockRejectedValue(new Error('REPORT_TARGET_ID_REQUIRED'));

      const res = await request(app)
        .post('/api/reports')
        .set('Cookie', `accessToken=${userToken}`)
        .send({
          targetType: 'PORTFOLIO',
          targetId: 'p-1',
          reason: 'Contenu inapproprié',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('obligatoire');
    });

    it("TC-REP-05 : createReport cible introuvable -> 404", async () => {
      reportService.createReport.mockRejectedValue(new Error('REPORT_TARGET_NOT_FOUND'));

      const res = await request(app)
        .post('/api/reports')
        .set('Cookie', `accessToken=${userToken}`)
        .send({
          targetType: 'PORTFOLIO',
          targetId: 'p-1',
          reason: 'Contenu inapproprié',
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('introuvable');
    });

    it('TC-REP-06 : createReport déjà existant -> 409', async () => {
      reportService.createReport.mockRejectedValue(new Error('REPORT_ALREADY_EXISTS'));

      const res = await request(app)
        .post('/api/reports')
        .set('Cookie', `accessToken=${userToken}`)
        .send({
          targetType: 'PORTFOLIO',
          targetId: 'p-1',
          reason: 'Contenu inapproprié',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('déjà');
    });

  });

});
