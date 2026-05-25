'use strict';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const express = require('express');
const cookieParser = require('cookie-parser');

// Charger le .env avant tout
require('dotenv').config();

jest.mock('../../../src/logs/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

const professionalRouter = require('../../../src/routes/professionalRoutes');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/professional', professionalRouter);

const SECRET = process.env.ACCESS_TOKEN_SECRET;

const makeToken = (role = 'PROFESSIONAL', roleId = 20, expiresIn = '1h') =>
  jwt.sign(
    { userId: 1, role, roleId },
    SECRET,
    { expiresIn }
  );

const professionalToken = makeToken();

beforeEach(() => jest.clearAllMocks());

describe("Tests d'Intégration - Routes Professionnel", () => {

  describe('Sécurité & Rôles', () => {

    it('TC-PRO-01 : Sans token → 401', async () => {
      const res = await request(app).get('/api/professional/dashboard');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('TC-PRO-02 : Token expiré → 401', async () => {
      const expiredToken = makeToken('PROFESSIONAL', 20, '-1s');
      const res = await request(app)
        .get('/api/professional/dashboard')
        .set('Cookie', `accessToken=${expiredToken}`);
      expect(res.status).toBe(401);
    });

    it('TC-PRO-03 : Étudiant tente accès Professionnel → 403', async () => {
      const res = await request(app)
        .get('/api/professional/dashboard')
        .set('Cookie', `accessToken=${makeToken('STUDENT')}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

  });

  describe('Endpoints Logic', () => {

    it('TC-PRO-04 : Professionnel accède au Dashboard → 200 OK', async () => {
      const res = await request(app)
        .get('/api/professional/dashboard')
        .set('Cookie', `accessToken=${professionalToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.area).toBe('professional');
      expect(res.body.data.user).toBeDefined();
    });

    it('TC-PRO-05 : Professionnel accède au Profil → 200 OK', async () => {
      const res = await request(app)
        .get('/api/professional/profile')
        .set('Cookie', `accessToken=${professionalToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.user).toBeDefined();
    });

  });

});