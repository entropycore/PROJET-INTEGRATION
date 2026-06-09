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

jest.mock('../../../src/services/student/academicPathService');
const academicPathService = require('../../../src/services/student/academicPathService');

const academicPathsRouter = require('../../../src/routes/academicPathsRoutes');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/academic-paths', academicPathsRouter);

const makeToken = (role = 'STUDENT', roleId = 40) =>
  jwt.sign(
    { userId: 1, role, roleId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );

const studentToken = makeToken();

beforeEach(() => jest.clearAllMocks());

describe("Tests d'Intégration - Routes Parcours Académique (academicPathsRoutes)", () => {

  describe('Sécurité & Rôles', () => {
    it('TC-STU-AP-SEC-01 : Sans token -> 401', async () => {
      const res = await request(app).get('/api/academic-paths/me');
      expect(res.status).toBe(401);
    });

    it('TC-STU-AP-SEC-02 : Professeur accède -> 403', async () => {
      const res = await request(app)
        .get('/api/academic-paths/me')
        .set('Cookie', `accessToken=${makeToken('PROFESSOR')}`);
      expect(res.status).toBe(403);
    });
  });

  describe('Endpoints Logic', () => {

    describe('GET /me', () => {
      it('TC-STU-AP-01 : listAcademicPaths -> 200', async () => {
        academicPathService.listAcademicPaths.mockResolvedValue([{ id: 'ap-1', school: 'ENSA' }]);

        const res = await request(app)
          .get('/api/academic-paths/me')
          .set('Cookie', `accessToken=${studentToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(1);
        expect(academicPathService.listAcademicPaths).toHaveBeenCalledWith(1);
      });
    });

    describe('POST /', () => {
      it('TC-STU-AP-02 : createAcademicPath -> 201', async () => {
        academicPathService.createAcademicPath.mockResolvedValue({ id: 'ap-1', school: 'ENSA' });

        const res = await request(app)
          .post('/api/academic-paths/')
          .set('Cookie', `accessToken=${studentToken}`)
          .send({ school: 'ENSA', year: 2026 });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(academicPathService.createAcademicPath).toHaveBeenCalledWith(1, { school: 'ENSA', year: 2026 });
      });
    });

    describe('PUT /:academicPathId', () => {
      it('TC-STU-AP-03 : updateAcademicPath -> 200', async () => {
        academicPathService.updateAcademicPath.mockResolvedValue({ id: 'ap-1', school: 'ENSA Modifiée' });

        const res = await request(app)
          .put('/api/academic-paths/ap-1')
          .set('Cookie', `accessToken=${studentToken}`)
          .send({ school: 'ENSA Modifiée' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(academicPathService.updateAcademicPath).toHaveBeenCalledWith(1, 'ap-1', { school: 'ENSA Modifiée' });
      });
    });

    describe('DELETE /:academicPathId', () => {
      it('TC-STU-AP-04 : deleteAcademicPath -> 200', async () => {
        academicPathService.deleteAcademicPath.mockResolvedValue({ success: true });

        const res = await request(app)
          .delete('/api/academic-paths/ap-1')
          .set('Cookie', `accessToken=${studentToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(academicPathService.deleteAcademicPath).toHaveBeenCalledWith(1, 'ap-1');
      });
    });

  });

});
