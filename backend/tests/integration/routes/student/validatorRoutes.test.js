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

jest.mock('../../../../src/services/student/validatorService');
const validatorService = require('../../../../src/services/student/validatorService');

const validatorRouter = require('../../../../src/routes/student/validatorRoutes');
const authMiddleware = require('../../../../src/middlewares/authMiddleware');
const checkRoles = require('../../../../src/middlewares/checkRoles');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/student', authMiddleware, checkRoles('STUDENT'), validatorRouter);

const makeToken = (role = 'STUDENT', roleId = 40) =>
  jwt.sign(
    { userId: 1, role, roleId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );

const studentToken = makeToken();

beforeEach(() => jest.clearAllMocks());

describe("Tests d'Intégration - Routes Validateurs Étudiant (validatorRoutes)", () => {

  describe('Sécurité & Rôles', () => {

    it('TC-STU-VAL-SEC-01 : Sans token -> 401', async () => {
      const res = await request(app).get('/api/student/validators');
      expect(res.status).toBe(401);
    });

    it('TC-STU-VAL-SEC-02 : Professeur accède -> 403', async () => {
      const res = await request(app)
        .get('/api/student/validators')
        .set('Cookie', `accessToken=${makeToken('PROFESSOR')}`);
      expect(res.status).toBe(403);
    });

  });

  describe('Endpoints Logic', () => {

    it('TC-STU-VAL-01 : listValidators -> 200', async () => {
      validatorService.listStudentValidators.mockResolvedValue([{ id: 'prof-1', firstName: 'Ahmed' }]);

      const res = await request(app)
        .get('/api/student/validators')
        .set('Cookie', `accessToken=${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(validatorService.listStudentValidators).toHaveBeenCalled();
    });

  });

});
