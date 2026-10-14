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

const badgeRouter = require('../../../../src/routes/administrator/badgeRoutes');
const authMiddleware = require('../../../../src/middlewares/authMiddleware');
const checkRoles = require('../../../../src/middlewares/checkRoles');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/admin', authMiddleware, checkRoles('ADMINISTRATOR'), badgeRouter);

const makeToken = (role = 'ADMINISTRATOR', roleId = 'admin-role-id') =>
  jwt.sign(
    { userId: 'admin-user-id', role, roleId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );

const adminToken = makeToken();

beforeEach(() => jest.clearAllMocks());

describe("Tests d'Intégration - Routes de Gestion des Badges (badgeRoutes)", () => {

  describe('Sécurité & Autorisation', () => {

    it('TC-BADGE-SEC-01 : Sans token -> 401', async () => {
      const res = await request(app).get('/api/admin/badges');
      expect(res.status).toBe(401);
    });

    it('TC-BADGE-SEC-02 : Rôle non ADMINISTRATOR -> 403', async () => {
      const res = await request(app)
        .get('/api/admin/badges')
        .set('Cookie', `accessToken=${makeToken('STUDENT')}`);
      expect(res.status).toBe(403);
    });

  });

  describe('Endpoints Logic', () => {

    it('TC-BADGE-01 : Liste badges -> 200', async () => {
      administratorService.listBadges.mockResolvedValue({
        items: [{ id: 'badge-1', name: 'Super Dev' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      const res = await request(app)
        .get('/api/admin/badges?search=Dev')
        .set('Cookie', `accessToken=${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(1);
      expect(administratorService.listBadges).toHaveBeenCalledWith({
        search: 'Dev',
        page: 1,
        limit: 10,
      });
    });

    it('TC-BADGE-02 : Création réussie -> 201', async () => {
      administratorService.createBadge.mockResolvedValue({ id: 'badge-2', name: 'React Expert' });

      const res = await request(app)
        .post('/api/admin/badges')
        .set('Cookie', `accessToken=${adminToken}`)
        .send({ name: 'React Expert', rule: 'projects >= 5' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('React Expert');
      expect(administratorService.createBadge).toHaveBeenCalledWith({
        name: 'React Expert',
        rule: 'projects >= 5',
      });
    });

    it('TC-BADGE-03 : Création échouée - Champs obligatoires manquants -> 400', async () => {
      administratorService.createBadge.mockRejectedValue(new Error('BADGE_REQUIRED_FIELDS'));

      const res = await request(app)
        .post('/api/admin/badges')
        .set('Cookie', `accessToken=${adminToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/obligatoires/i);
    });

    it('TC-BADGE-04 : Création échouée - Nom existant -> 409', async () => {
      administratorService.createBadge.mockRejectedValue(new Error('BADGE_NAME_ALREADY_EXISTS'));

      const res = await request(app)
        .post('/api/admin/badges')
        .set('Cookie', `accessToken=${adminToken}`)
        .send({ name: 'Duplicate' });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/existe déjà/i);
    });

    it('TC-BADGE-05 : Modification réussie -> 200', async () => {
      administratorService.updateBadge.mockResolvedValue({ id: 'badge-1', name: 'Updated Dev' });

      const res = await request(app)
        .put('/api/admin/badges/badge-1')
        .set('Cookie', `accessToken=${adminToken}`)
        .send({ name: 'Updated Dev' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Updated Dev');
      expect(administratorService.updateBadge).toHaveBeenCalledWith('badge-1', {
        name: 'Updated Dev',
      });
    });

    it('TC-BADGE-06 : Modification échouée - Badge introuvable -> 404', async () => {
      administratorService.updateBadge.mockRejectedValue(new Error('BADGE_NOT_FOUND'));

      const res = await request(app)
        .put('/api/admin/badges/uuid-inexistant')
        .set('Cookie', `accessToken=${adminToken}`)
        .send({ name: 'Updated Dev' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/introuvable/i);
    });

    it('TC-BADGE-07 : Suppression réussie -> 200', async () => {
      administratorService.deleteBadge.mockResolvedValue({ success: true });

      const res = await request(app)
        .delete('/api/admin/badges/badge-1')
        .set('Cookie', `accessToken=${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(administratorService.deleteBadge).toHaveBeenCalledWith('badge-1');
    });

    it('TC-BADGE-08 : Suppression échouée - Badge introuvable -> 404', async () => {
      administratorService.deleteBadge.mockRejectedValue(new Error('BADGE_NOT_FOUND'));

      const res = await request(app)
        .delete('/api/admin/badges/uuid-inexistant')
        .set('Cookie', `accessToken=${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/introuvable/i);
    });

  });

});
