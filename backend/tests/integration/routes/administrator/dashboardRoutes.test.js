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

const dashboardRouter = require('../../../../src/routes/administrator/dashboardRoutes');
const authMiddleware = require('../../../../src/middlewares/authMiddleware');
const checkRoles = require('../../../../src/middlewares/checkRoles');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/admin', authMiddleware, checkRoles('ADMINISTRATOR'), dashboardRouter);

const makeToken = (role = 'ADMINISTRATOR', roleId = 'admin-role-id') =>
  jwt.sign(
    { userId: 'admin-user-id', role, roleId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );

const adminToken = makeToken();

beforeEach(() => jest.clearAllMocks());

describe("Tests d'Intégration - Routes de Gestion du Dashboard (dashboardRoutes)", () => {

  describe('Sécurité & Autorisation', () => {

    it('TC-DASH-SEC-01 : Sans token -> 401', async () => {
      const res = await request(app).get('/api/admin/dashboard');
      expect(res.status).toBe(401);
    });

    it('TC-DASH-SEC-02 : Rôle non ADMINISTRATOR -> 403', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Cookie', `accessToken=${makeToken('STUDENT')}`);
      expect(res.status).toBe(403);
    });

  });

  describe('Endpoints Logic', () => {

    it('TC-DASH-01 : getDashboard -> 200', async () => {
      administratorService.getDashboardData.mockResolvedValue({
        summaryCards: { totalUsers: { value: 5 } },
      });

      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Cookie', `accessToken=${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summaryCards.totalUsers.value).toBe(5);
      expect(administratorService.getDashboardData).toHaveBeenCalled();
    });

    it('TC-DASH-02 : getDashboardItemDetail -> 200', async () => {
      administratorService.getDashboardItemDetail.mockResolvedValue({
        id: 'user-uuid-002', type: 'ACCESS_REQUEST', status: 'PENDING'
      });

      const res = await request(app)
        .get('/api/admin/dashboard-items/ACCESS_REQUEST/user-uuid-002')
        .set('Cookie', `accessToken=${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('user-uuid-002');
      expect(administratorService.getDashboardItemDetail).toHaveBeenCalledWith('ACCESS_REQUEST', 'user-uuid-002');
    });

    it('TC-DASH-03 : getDashboardItemDetail - Type non supporté -> 400', async () => {
      administratorService.getDashboardItemDetail.mockRejectedValue(new Error('UNSUPPORTED_DASHBOARD_ITEM_TYPE'));

      const res = await request(app)
        .get('/api/admin/dashboard-items/TYPE_INVALIDE/some-id')
        .set('Cookie', `accessToken=${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/pas supporté/i);
    });

    it('TC-DASH-04 : getDashboardItemDetail - Item introuvable -> 404', async () => {
      administratorService.getDashboardItemDetail.mockRejectedValue(new Error('DASHBOARD_ITEM_NOT_FOUND'));

      const res = await request(app)
        .get('/api/admin/dashboard-items/ACCESS_REQUEST/uuid-inexistant')
        .set('Cookie', `accessToken=${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/introuvable/i);
    });

    it('TC-DASH-05 : approveDashboardItem -> 200', async () => {
      administratorService.approveDashboardItem.mockResolvedValue({ id: 'item-1', status: 'APPROVED' });

      const res = await request(app)
        .patch('/api/admin/dashboard-items/ACCESS_REQUEST/item-1/approve')
        .set('Cookie', `accessToken=${adminToken}`)
        .send({ note: 'Approuvé' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('APPROVED');
      expect(administratorService.approveDashboardItem).toHaveBeenCalledWith(
        'ACCESS_REQUEST',
        'item-1',
        'admin-role-id',
        { note: 'Approuvé' }
      );
    });

    it('TC-DASH-06 : rejectDashboardItem -> 200', async () => {
      administratorService.rejectDashboardItem.mockResolvedValue({ id: 'item-1', status: 'REJECTED' });

      const res = await request(app)
        .patch('/api/admin/dashboard-items/ACCESS_REQUEST/item-1/reject')
        .set('Cookie', `accessToken=${adminToken}`)
        .send({ reason: 'Invalide' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('REJECTED');
      expect(administratorService.rejectDashboardItem).toHaveBeenCalledWith(
        'ACCESS_REQUEST',
        'item-1',
        'admin-role-id',
        { reason: 'Invalide' }
      );
    });

  });

});
