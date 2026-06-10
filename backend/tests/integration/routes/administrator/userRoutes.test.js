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

const userRouter = require('../../../../src/routes/administrator/userRoutes');
const authMiddleware = require('../../../../src/middlewares/authMiddleware');
const checkRoles = require('../../../../src/middlewares/checkRoles');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/admin', authMiddleware, checkRoles('ADMINISTRATOR'), userRouter);

const makeToken = (role = 'ADMINISTRATOR', roleId = 'admin-role-id') =>
  jwt.sign(
    { userId: 'admin-user-id', role, roleId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );

const adminToken = makeToken();

beforeEach(() => jest.clearAllMocks());

describe("Tests d'Intégration - Routes des Utilisateurs & Profil (userRoutes)", () => {

  describe('Sécurité & Autorisation', () => {

    it('TC-USR-SEC-01 : Sans token -> 401', async () => {
      const res = await request(app).get('/api/admin/users');
      expect(res.status).toBe(401);
    });

    it('TC-USR-SEC-02 : Rôle non ADMINISTRATOR -> 403', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Cookie', `accessToken=${makeToken('STUDENT')}`);
      expect(res.status).toBe(403);
    });

  });

  describe('Endpoints Logic', () => {

    describe('GET /profile', () => {

      it('TC-USR-01 : Profil admin chargé -> 200', async () => {
        administratorService.getAdministratorProfile.mockResolvedValue({
          id: 'admin-role-id',
          employeeId: 'ADM-1234',
        });

        const res = await request(app)
          .get('/api/admin/profile')
          .set('Cookie', `accessToken=${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.employeeId).toBe('ADM-1234');
        expect(administratorService.getAdministratorProfile).toHaveBeenCalledWith('admin-user-id');
      });

    });

    describe('GET /users', () => {

      it('TC-USR-02 : Liste utilisateurs avec filtres par défaut -> 200', async () => {
        administratorService.listUsers.mockResolvedValue({
          items: [{ id: 'user-1', email: 'test@ensa.ac.ma', role: 'STUDENT' }],
          pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
        });

        const res = await request(app)
          .get('/api/admin/users')
          .set('Cookie', `accessToken=${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.items).toHaveLength(1);
        expect(administratorService.listUsers).toHaveBeenCalledWith({
          role: undefined,
          status: undefined,
          search: undefined,
          page: 1,
          limit: 10,
        });
      });

      it('TC-USR-03 : Liste utilisateurs avec filtres spécifiques -> 200', async () => {
        administratorService.listUsers.mockResolvedValue({
          items: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 1 }
        });

        const res = await request(app)
          .get('/api/admin/users?role=student&status=active&search=test')
          .set('Cookie', `accessToken=${adminToken}`);

        expect(res.status).toBe(200);
        expect(administratorService.listUsers).toHaveBeenCalledWith({
          role: 'STUDENT',
          status: 'ACTIVE',
          search: 'test',
          page: 1,
          limit: 10,
        });
      });

      it('TC-USR-04 : Filtre rôle invalide -> 400', async () => {
        const res = await request(app)
          .get('/api/admin/users?role=INVALID_ROLE')
          .set('Cookie', `accessToken=${adminToken}`);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
      });

      it('TC-USR-05 : Filtre status invalide -> 400', async () => {
        const res = await request(app)
          .get('/api/admin/users?status=INVALID_STATUS')
          .set('Cookie', `accessToken=${adminToken}`);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
      });

    });

    describe('POST /users', () => {

      it('TC-USR-06 : Création utilisateur réussie -> 201', async () => {
        administratorService.createUser.mockResolvedValue({
          id: 'user-2',
          email: 'new@ensa.ac.ma',
          role: 'STUDENT'
        });

        const res = await request(app)
          .post('/api/admin/users')
          .set('Cookie', `accessToken=${adminToken}`)
          .send({
            email: 'new@ensa.ac.ma',
            role: 'student',
            accountStatus: 'pending'
          });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(administratorService.createUser).toHaveBeenCalledWith({
          email: 'new@ensa.ac.ma',
          role: 'STUDENT',
          accountStatus: 'PENDING'
        });
      });

      it('TC-USR-07 : Création échouée - Email déjà utilisé -> 409', async () => {
        administratorService.createUser.mockRejectedValue(new Error('EMAIL_ALREADY_EXISTS'));

        const res = await request(app)
          .post('/api/admin/users')
          .set('Cookie', `accessToken=${adminToken}`)
          .send({ email: 'existing@ensa.ac.ma', role: 'student' });

        expect(res.status).toBe(409);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/déjà utilisé/i);
      });

    });

    describe('GET /users/:userId', () => {

      it('TC-USR-08 : Utilisateur trouvé -> 200', async () => {
        administratorService.getUserById.mockResolvedValue({
          id: 'user-1',
          email: 'test@ensa.ac.ma',
          role: 'STUDENT'
        });

        const res = await request(app)
          .get('/api/admin/users/user-1')
          .set('Cookie', `accessToken=${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBe('user-1');
        expect(administratorService.getUserById).toHaveBeenCalledWith('user-1');
      });

      it('TC-USR-09 : Utilisateur introuvable -> 404', async () => {
        administratorService.getUserById.mockRejectedValue(new Error('USER_NOT_FOUND'));

        const res = await request(app)
          .get('/api/admin/users/user-inexistant')
          .set('Cookie', `accessToken=${adminToken}`);

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/introuvable/i);
      });

    });

    describe('PUT /users/:userId', () => {

      it('TC-USR-10 : Modification réussie -> 200', async () => {
        administratorService.updateUser.mockResolvedValue({
          id: 'user-1',
          email: 'updated@ensa.ac.ma'
        });

        const res = await request(app)
          .put('/api/admin/users/user-1')
          .set('Cookie', `accessToken=${adminToken}`)
          .send({ email: 'updated@ensa.ac.ma', role: 'student' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(administratorService.updateUser).toHaveBeenCalledWith('user-1', {
          email: 'updated@ensa.ac.ma',
          role: 'STUDENT'
        });
      });

    });

    describe('PATCH /users/:userId/status', () => {

      it('TC-USR-11 : Statut mis à jour -> 200', async () => {
        administratorService.updateUserStatus.mockResolvedValue({
          id: 'user-1',
          accountStatus: 'SUSPENDED'
        });

        const res = await request(app)
          .patch('/api/admin/users/user-1/status')
          .set('Cookie', `accessToken=${adminToken}`)
          .send({ status: 'suspended', reason: 'Comportement suspect' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(administratorService.updateUserStatus).toHaveBeenCalledWith(
          'user-1',
          'SUSPENDED',
          'admin-role-id',
          'Comportement suspect'
        );
      });

      it('TC-USR-12 : Statut fourni invalide -> 400', async () => {
        const res = await request(app)
          .patch('/api/admin/users/user-1/status')
          .set('Cookie', `accessToken=${adminToken}`)
          .send({ status: 'INVALID_STATUS' });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
      });

    });

    describe('PATCH /users/:userId/role', () => {

      it('TC-USR-13 : Rôle mis à jour -> 200', async () => {
        administratorService.updateUserRole.mockResolvedValue({
          id: 'user-1',
          role: 'PROFESSOR'
        });

        const res = await request(app)
          .patch('/api/admin/users/user-1/role')
          .set('Cookie', `accessToken=${adminToken}`)
          .send({ role: 'professor', department: 'Maths' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(administratorService.updateUserRole).toHaveBeenCalledWith(
          'user-1',
          'PROFESSOR',
          { role: 'professor', department: 'Maths' },
          'admin-user-id'
        );
      });

      it('TC-USR-14 : Rôle fourni invalide -> 400', async () => {
        const res = await request(app)
          .patch('/api/admin/users/user-1/role')
          .set('Cookie', `accessToken=${adminToken}`)
          .send({ role: 'INVALID_ROLE' });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
      });

    });

    describe('PATCH /users/:userId/reset-password', () => {

      it('TC-USR-15 : Réinitialisation mot de passe réussie -> 200', async () => {
        administratorService.resetUserPassword.mockResolvedValue({
          success: true
        });

        const res = await request(app)
          .patch('/api/admin/users/user-1/reset-password')
          .set('Cookie', `accessToken=${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(administratorService.resetUserPassword).toHaveBeenCalledWith('user-1');
      });

    });

    describe('DELETE /users/:userId', () => {

      it('TC-USR-16 : Suppression réussie -> 200', async () => {
        administratorService.deleteUser.mockResolvedValue({
          success: true
        });

        const res = await request(app)
          .delete('/api/admin/users/user-1')
          .set('Cookie', `accessToken=${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(administratorService.deleteUser).toHaveBeenCalledWith('user-1', 'admin-user-id');
      });

      it('TC-USR-17 : Suppression impossible (liaison de données) -> 409', async () => {
        administratorService.deleteUser.mockRejectedValue(new Error('USER_DELETE_BLOCKED_BY_RELATED_DATA'));

        const res = await request(app)
          .delete('/api/admin/users/user-1')
          .set('Cookie', `accessToken=${adminToken}`);

        expect(res.status).toBe(409);
        expect(res.body.success).toBe(false);
      });

    });

  });

});
