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

jest.mock('../../../src/services/student/skillService');
const studentSkillService = require('../../../src/services/student/skillService');

const skillsRouter = require('../../../src/routes/skillsRoutes');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/skills', skillsRouter);

const makeToken = (role = 'STUDENT', roleId = 40) =>
  jwt.sign(
    { userId: 1, role, roleId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );

const studentToken = makeToken();

beforeEach(() => jest.clearAllMocks());

describe("Tests d'Intégration - Routes Catalogue de Compétences (skillsRoutes)", () => {

  describe('Sécurité & Rôles', () => {
    it('TC-STU-SKILLSCAT-SEC-01 : Sans token -> 401', async () => {
      const res = await request(app).get('/api/skills/');
      expect(res.status).toBe(401);
    });

    it('TC-STU-SKILLSCAT-SEC-02 : Professeur accède -> 403', async () => {
      const res = await request(app)
        .get('/api/skills/')
        .set('Cookie', `accessToken=${makeToken('PROFESSOR')}`);
      expect(res.status).toBe(403);
    });
  });

  describe('Endpoints Logic', () => {
    it('TC-STU-SKILLSCAT-01 : listSkillsCatalog -> 200', async () => {
      studentSkillService.listSkillsCatalog.mockResolvedValue([{ id: 'sc-1', name: 'Docker' }]);

      const res = await request(app)
        .get('/api/skills/')
        .set('Cookie', `accessToken=${studentToken}`)
        .query({ search: 'Doc' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(studentSkillService.listSkillsCatalog).toHaveBeenCalledWith('Doc');
    });
  });

});
