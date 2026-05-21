'use strict';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const express = require('express');
const cookieParser = require('cookie-parser');

require('dotenv').config();

jest.mock('../../../src/logs/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

const professorRouter = require('../../../src/routes/professorRoutes');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/professor', professorRouter);

const SECRET = process.env.ACCESS_TOKEN_SECRET;

const makeToken = (role = 'PROFESSOR', roleId = 30, expiresIn = '1h') =>
  jwt.sign(
    { userId: 1, role, roleId },
    SECRET,
    { expiresIn }
  );

const professorToken = makeToken();

beforeEach(() => jest.clearAllMocks());

describe("Tests d'Intégration - Routes Professeur", () => {

  describe('Sécurité & Rôles', () => {

    it('TC-PRF-01 : Sans token → 401', async () => {
      const res = await request(app).get('/api/professor/dashboard');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('TC-PRF-02 : Token expiré → 401', async () => {
      const expiredToken = makeToken('PROFESSOR', 30, '-1s');
      const res = await request(app)
        .get('/api/professor/dashboard')
        .set('Cookie', `accessToken=${expiredToken}`);
      expect(res.status).toBe(401);
    });

    it('TC-PRF-03 : Étudiant tente accès Professeur → 403', async () => {
      const res = await request(app)
        .get('/api/professor/dashboard')
        .set('Cookie', `accessToken=${makeToken('STUDENT')}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

  });

  describe('Endpoints Logic', () => {

    it('TC-PRF-04 : Professeur accède au Dashboard → 200 OK', async () => {
      const res = await request(app)
        .get('/api/professor/dashboard')
        .set('Cookie', `accessToken=${professorToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.area).toBe('professor');
      expect(res.body.data.user).toBeDefined();
    });

    it('TC-PRF-05 : Professeur accède au Profil → 200 OK', async () => {
      const res = await request(app)
        .get('/api/professor/profile')
        .set('Cookie', `accessToken=${professorToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.user).toBeDefined();
    });

  });

});