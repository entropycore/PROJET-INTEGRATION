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

jest.mock('../../../../src/services/administratorService');
const administratorService = require('../../../../src/services/administratorService');

const reportRouter = require('../../../../src/routes/administrator/reportRoutes');
const authMiddleware = require('../../../../src/middlewares/authMiddleware');
const checkRoles = require('../../../../src/middlewares/checkRoles');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/admin', authMiddleware, checkRoles('ADMINISTRATOR'), reportRouter);

const makeToken = (role = 'ADMINISTRATOR', roleId = 'admin-role-id') =>
  jwt.sign(
    { userId: 'admin-user-id', role, roleId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );

const adminToken = makeToken();

beforeEach(() => jest.clearAllMocks());

describe("Tests d'Intégration - Routes des Signalements (reportRoutes)", () => {

  describe('Sécurité & Autorisation', () => {

    it('TC-REP-SEC-01 : Sans token -> 401', async () => {
      const res = await request(app).get('/api/admin/reports');
      expect(res.status).toBe(401);
    });

    it('TC-REP-SEC-02 : Rôle non ADMINISTRATOR -> 403', async () => {
      const res = await request(app)
        .get('/api/admin/reports')
        .set('Cookie', `accessToken=${makeToken('STUDENT')}`);
      expect(res.status).toBe(403);
    });

  });

  describe('Endpoints Logic', () => {

    describe('GET /reports', () => {

      it('TC-REP-01 : Liste signalements avec filtres par défaut -> 200', async () => {
        administratorService.listReports.mockResolvedValue({
          items: [{ id: 'report-1', targetType: 'PROJECT', status: 'PENDING' }],
          pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
        });

        const res = await request(app)
          .get('/api/admin/reports')
          .set('Cookie', `accessToken=${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.items).toHaveLength(1);
        expect(administratorService.listReports).toHaveBeenCalledWith({
          status: 'PENDING',
          targetType: undefined,
          search: undefined,
          page: 1,
          limit: 10,
        });
      });

      it('TC-REP-02 : Liste signalements avec tous les filtres spécifiés -> 200', async () => {
        administratorService.listReports.mockResolvedValue({
          items: [],
          pagination: { page: 2, limit: 5, total: 0, totalPages: 1 }
        });

        const res = await request(app)
          .get('/api/admin/reports?status=APPROVED&targetType=PORTFOLIO&search=alert&page=2&limit=5')
          .set('Cookie', `accessToken=${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(administratorService.listReports).toHaveBeenCalledWith({
          status: 'APPROVED',
          targetType: 'PORTFOLIO',
          search: 'alert',
          page: 2,
          limit: 5,
        });
      });

      it('TC-REP-03 : Filtre status invalide -> 400', async () => {
        const res = await request(app)
          .get('/api/admin/reports?status=INVALID_STATUS')
          .set('Cookie', `accessToken=${adminToken}`);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/status est invalide/i);
      });

      it('TC-REP-04 : Filtre targetType invalide -> 400', async () => {
        const res = await request(app)
          .get('/api/admin/reports?targetType=INVALID_TARGET')
          .set('Cookie', `accessToken=${adminToken}`);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/targetType est invalide/i);
      });

    });

    describe('GET /reports/pending-count', () => {

      it('TC-REP-05 : Compteur signalements en attente -> 200', async () => {
        administratorService.getPendingReportsCount.mockResolvedValue(5);

        const res = await request(app)
          .get('/api/admin/reports/pending-count')
          .set('Cookie', `accessToken=${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.count).toBe(5);
        expect(administratorService.getPendingReportsCount).toHaveBeenCalled();
      });

    });

    describe('GET /reports/:reportId', () => {

      it('TC-REP-06 : Signalement trouvé -> 200', async () => {
        administratorService.getReportById.mockResolvedValue({
          id: 'report-1',
          targetType: 'PROJECT',
          status: 'PENDING'
        });

        const res = await request(app)
          .get('/api/admin/reports/report-1')
          .set('Cookie', `accessToken=${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBe('report-1');
        expect(administratorService.getReportById).toHaveBeenCalledWith('report-1');
      });

      it('TC-REP-07 : Signalement introuvable -> 404', async () => {
        administratorService.getReportById.mockRejectedValue(new Error('REPORT_NOT_FOUND'));

        const res = await request(app)
          .get('/api/admin/reports/report-inexistant')
          .set('Cookie', `accessToken=${adminToken}`);

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/introuvable/i);
      });

    });

    describe('PATCH /reports/:reportId/resolve', () => {

      it('TC-REP-08 : Résolution réussie -> 200', async () => {
        administratorService.resolveReportLegacy.mockResolvedValue({
          id: 'report-1',
          status: 'APPROVED'
        });

        const res = await request(app)
          .patch('/api/admin/reports/report-1/resolve')
          .set('Cookie', `accessToken=${adminToken}`)
          .send({ resolutionNote: 'Résolu proprement' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(administratorService.resolveReportLegacy).toHaveBeenCalledWith(
          'report-1',
          'admin-role-id',
          'Résolu proprement'
        );
      });

    });

    describe('PATCH /reports/:reportId/approve', () => {

      it('TC-REP-09 : Approbation signalement réussie -> 200', async () => {
        administratorService.approveReport.mockResolvedValue({
          id: 'report-1',
          status: 'APPROVED'
        });

        const res = await request(app)
          .patch('/api/admin/reports/report-1/approve')
          .set('Cookie', `accessToken=${adminToken}`)
          .send({ resolutionNote: 'Approuvé' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(administratorService.approveReport).toHaveBeenCalledWith(
          'report-1',
          'admin-role-id',
          'Approuvé'
        );
      });

    });

    describe('PATCH /reports/:reportId/reject', () => {

      it('TC-REP-10 : Rejet signalement réussi -> 200', async () => {
        administratorService.rejectReport.mockResolvedValue({
          id: 'report-1',
          status: 'REJECTED'
        });

        const res = await request(app)
          .patch('/api/admin/reports/report-1/reject')
          .set('Cookie', `accessToken=${adminToken}`)
          .send({ reason: 'Signalement abusif' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(administratorService.rejectReport).toHaveBeenCalledWith(
          'report-1',
          'admin-role-id',
          'Signalement abusif'
        );
      });

    });

    describe('DELETE /reports/:reportId/target', () => {

      it('TC-REP-11 : Suppression cible signalée réussie -> 200', async () => {
        administratorService.deleteReportedTarget.mockResolvedValue({
          success: true
        });

        const res = await request(app)
          .delete('/api/admin/reports/report-1/target')
          .set('Cookie', `accessToken=${adminToken}`)
          .send({ comment: 'Contenu inapproprié' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(administratorService.deleteReportedTarget).toHaveBeenCalledWith(
          'report-1',
          'admin-role-id',
          'Contenu inapproprié'
        );
      });

    });

  });

});
