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

const professionalRequestRouter = require('../../../../src/routes/administrator/professionalRequestRoutes');
const authMiddleware = require('../../../../src/middlewares/authMiddleware');
const checkRoles = require('../../../../src/middlewares/checkRoles');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/admin', authMiddleware, checkRoles('ADMINISTRATOR'), professionalRequestRouter);

const makeToken = (role = 'ADMINISTRATOR', roleId = 'admin-role-id') =>
  jwt.sign(
    { userId: 'admin-user-id', role, roleId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );

const adminToken = makeToken();

beforeEach(() => jest.clearAllMocks());

describe("Tests d'Intégration - Routes de Demande Professionnelle (professionalRequestRoutes)", () => {

  describe('Sécurité & Autorisation', () => {

    it('TC-PRO-SEC-01 : Sans token -> 401', async () => {
      const res = await request(app).get('/api/admin/professional-requests');
      expect(res.status).toBe(401);
    });

    it('TC-PRO-SEC-02 : Rôle non ADMINISTRATOR -> 403', async () => {
      const res = await request(app)
        .get('/api/admin/professional-requests')
        .set('Cookie', `accessToken=${makeToken('STUDENT')}`);
      expect(res.status).toBe(403);
    });

  });

  describe('Endpoints Logic', () => {

    describe('GET /professional-requests', () => {

      it('TC-PRO-01 : Liste demandes avec filtres par défaut -> 200', async () => {
        administratorService.listProfessionalRequests.mockResolvedValue({
          items: [{ id: 'user-1', email: 'pro@domain.ma', professional: { company: 'Company' } }],
          pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
        });

        const res = await request(app)
          .get('/api/admin/professional-requests')
          .set('Cookie', `accessToken=${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.items).toHaveLength(1);
        expect(res.body.data.filters.status).toBe('PENDING');
        expect(res.body.data.filters.emailVerified).toBeUndefined();
        expect(administratorService.listProfessionalRequests).toHaveBeenCalledWith({
          status: 'PENDING',
          emailVerified: undefined,
          search: undefined,
          page: 1,
          limit: 10,
        });
      });

      it('TC-PRO-02 : Liste demandes avec filtres spécifiques -> 200', async () => {
        administratorService.listProfessionalRequests.mockResolvedValue({
          items: [],
          pagination: { page: 2, limit: 5, total: 0, totalPages: 1 }
        });

        const res = await request(app)
          .get('/api/admin/professional-requests?status=ACTIVE&emailVerified=true&search=pro&page=2&limit=5')
          .set('Cookie', `accessToken=${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.filters.status).toBe('ACTIVE');
        expect(res.body.data.filters.emailVerified).toBe(true);
        expect(administratorService.listProfessionalRequests).toHaveBeenCalledWith({
          status: 'ACTIVE',
          emailVerified: true,
          search: 'pro',
          page: 2,
          limit: 5,
        });
      });

      it('TC-PRO-03 : Filtre status invalide -> 400', async () => {
        const res = await request(app)
          .get('/api/admin/professional-requests?status=INVALID_STATUS')
          .set('Cookie', `accessToken=${adminToken}`);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/status est invalide/i);
      });

      it('TC-PRO-04 : Filtre emailVerified invalide -> 400', async () => {
        const res = await request(app)
          .get('/api/admin/professional-requests?emailVerified=maybe')
          .set('Cookie', `accessToken=${adminToken}`);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/emailVerified doit valoir/i);
      });

    });

    describe('GET /professional-requests/:userId', () => {

      it('TC-PRO-05 : Demande trouvée -> 200', async () => {
        administratorService.getProfessionalRequest.mockResolvedValue({
          id: 'user-1',
          email: 'pro@domain.ma',
          professional: { company: 'Company' }
        });

        const res = await request(app)
          .get('/api/admin/professional-requests/user-1')
          .set('Cookie', `accessToken=${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBe('user-1');
        expect(administratorService.getProfessionalRequest).toHaveBeenCalledWith('user-1');
      });

      it('TC-PRO-06 : Demande introuvable -> 404', async () => {
        administratorService.getProfessionalRequest.mockRejectedValue(new Error('REQUEST_NOT_FOUND'));

        const res = await request(app)
          .get('/api/admin/professional-requests/user-inexistant')
          .set('Cookie', `accessToken=${adminToken}`);

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/introuvable/i);
      });

    });

    describe('PATCH /professional-requests/:userId/approve', () => {

      it('TC-PRO-07 : Approbation réussie -> 200', async () => {
        administratorService.approveProfessionalRequest.mockResolvedValue({
          id: 'user-1',
          accountStatus: 'ACTIVE'
        });

        const res = await request(app)
          .patch('/api/admin/professional-requests/user-1/approve')
          .set('Cookie', `accessToken=${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.accountStatus).toBe('ACTIVE');
        expect(administratorService.approveProfessionalRequest).toHaveBeenCalledWith('user-1', 'admin-role-id');
      });

      it('TC-PRO-08 : Approbation échouée - Demande introuvable -> 404', async () => {
        administratorService.approveProfessionalRequest.mockRejectedValue(new Error('REQUEST_NOT_FOUND'));

        const res = await request(app)
          .patch('/api/admin/professional-requests/user-inexistant/approve')
          .set('Cookie', `accessToken=${adminToken}`);

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/introuvable/i);
      });

      it('TC-PRO-09 : Approbation échouée - Email non vérifié -> 409', async () => {
        administratorService.approveProfessionalRequest.mockRejectedValue(new Error('EMAIL_NOT_VERIFIED'));

        const res = await request(app)
          .patch('/api/admin/professional-requests/user-1/approve')
          .set('Cookie', `accessToken=${adminToken}`);

        expect(res.status).toBe(409);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/email.*vérifié/i);
      });

    });

    describe('PATCH /professional-requests/:userId/reject', () => {

      it('TC-PRO-10 : Rejet réussi -> 200', async () => {
        administratorService.rejectProfessionalRequest.mockResolvedValue({
          id: 'user-1',
          accountStatus: 'REJECTED'
        });

        const res = await request(app)
          .patch('/api/admin/professional-requests/user-1/reject')
          .set('Cookie', `accessToken=${adminToken}`)
          .send({ rejectionReason: 'Dossier incomplet' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.accountStatus).toBe('REJECTED');
        expect(administratorService.rejectProfessionalRequest).toHaveBeenCalledWith(
          'user-1',
          'admin-role-id',
          'Dossier incomplet'
        );
      });

      it('TC-PRO-11 : Rejet échoué - Demande introuvable -> 404', async () => {
        administratorService.rejectProfessionalRequest.mockRejectedValue(new Error('REQUEST_NOT_FOUND'));

        const res = await request(app)
          .patch('/api/admin/professional-requests/user-inexistant/reject')
          .set('Cookie', `accessToken=${adminToken}`)
          .send({ rejectionReason: 'Invalide' });

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
      });

    });

  });

});
