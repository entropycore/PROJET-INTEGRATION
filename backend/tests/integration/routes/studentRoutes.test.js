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

const studentRouter = require('../../../src/routes/studentRoutes');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/student', studentRouter);

const SECRET = process.env.ACCESS_TOKEN_SECRET;

const makeToken = (role = 'STUDENT', roleId = 40, expiresIn = '1h') =>
  jwt.sign(
    { userId: 1, role, roleId },
    SECRET,
    { expiresIn }
  );

const studentToken = makeToken();

beforeEach(() => jest.clearAllMocks());

describe("Tests d'Intégration - Routes Étudiant", () => {

  describe('Sécurité & Rôles', () => {

    it('TC-STU-01 : Sans token → 401', async () => {
      const res = await request(app).get('/api/student/dashboard');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('TC-STU-02 : Token expiré → 401', async () => {
      const expiredToken = makeToken('STUDENT', 40, '-1s');
      const res = await request(app)
        .get('/api/student/dashboard')
        .set('Cookie', `accessToken=${expiredToken}`);
      expect(res.status).toBe(401);
    });

    it('TC-STU-03 : Professeur tente accès Étudiant → 403', async () => {
      const res = await request(app)
        .get('/api/student/dashboard')
        .set('Cookie', `accessToken=${makeToken('PROFESSOR')}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

  });

  describe('Endpoints Logic', () => {

    it('TC-STU-04 : Étudiant accède au Dashboard → 200 OK', async () => {
      const res = await request(app)
        .get('/api/student/dashboard')
        .set('Cookie', `accessToken=${studentToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.area).toBe('student');
      expect(res.body.data.user).toBeDefined();
    });

    it('TC-STU-05 : Étudiant accède au Profil → 200 OK', async () => {
      const res = await request(app)
        .get('/api/student/profile')
        .set('Cookie', `accessToken=${studentToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.user).toBeDefined();
    });

  });

});