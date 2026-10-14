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

jest.mock('../../../src/services/student/profileService');
const studentProfileService = require('../../../src/services/student/profileService');

jest.mock('../../../src/services/student/skillService');
const studentSkillService = require('../../../src/services/student/skillService');

const studentsRouter = require('../../../src/routes/studentsRoutes');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/students', studentsRouter);

const makeToken = (role = 'STUDENT', roleId = 40) =>
  jwt.sign(
    { userId: 1, role, roleId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );

const studentToken = makeToken();

beforeEach(() => jest.clearAllMocks());

describe("Tests d'Intégration - Routes Compatibilité Étudiants (studentsRoutes)", () => {

  describe('Sécurité & Rôles', () => {
    it('TC-STU-COMP-SEC-01 : Sans token -> 401', async () => {
      const res = await request(app).get('/api/students/me');
      expect(res.status).toBe(401);
    });

    it('TC-STU-COMP-SEC-02 : Professeur accède -> 403', async () => {
      const res = await request(app)
        .get('/api/students/me')
        .set('Cookie', `accessToken=${makeToken('PROFESSOR')}`);
      expect(res.status).toBe(403);
    });
  });

  describe('Endpoints Logic', () => {

    describe('GET /me', () => {
      it('TC-STU-COMP-01 : getProfileCompat -> 200', async () => {
        studentProfileService.getStudentProfileCompat.mockResolvedValue({ id: 1, major: 'Génie Informatique' });

        const res = await request(app)
          .get('/api/students/me')
          .set('Cookie', `accessToken=${studentToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.major).toBe('Génie Informatique');
        expect(studentProfileService.getStudentProfileCompat).toHaveBeenCalledWith(1);
      });
    });

    describe('PUT /me', () => {
      it('TC-STU-COMP-02 : updateProfileCompat -> 200', async () => {
        studentProfileService.updateStudentProfileCompat.mockResolvedValue({ id: 1, major: 'Génie Logiciel' });

        const res = await request(app)
          .put('/api/students/me')
          .set('Cookie', `accessToken=${studentToken}`)
          .send({ major: 'Génie Logiciel' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.major).toBe('Génie Logiciel');
        expect(studentProfileService.updateStudentProfileCompat).toHaveBeenCalledWith(1, { major: 'Génie Logiciel' });
      });
    });

    describe('GET /me/skills/stats', () => {
      it('TC-STU-COMP-03 : getSkillStats -> 200', async () => {
        studentSkillService.getStudentSkillStats.mockResolvedValue({ totalSkills: 7 });

        const res = await request(app)
          .get('/api/students/me/skills/stats')
          .set('Cookie', `accessToken=${studentToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.totalSkills).toBe(7);
        expect(studentSkillService.getStudentSkillStats).toHaveBeenCalledWith(1);
      });
    });

    describe('GET /me/skills', () => {
      it('TC-STU-COMP-04 : getSkills -> 200', async () => {
        studentSkillService.getStudentSkills.mockResolvedValue([{ id: 'skill-1', name: 'Node.js' }]);

        const res = await request(app)
          .get('/api/students/me/skills')
          .set('Cookie', `accessToken=${studentToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(1);
        expect(studentSkillService.getStudentSkills).toHaveBeenCalledWith(1);
      });
    });

    describe('POST /me/skills', () => {
      it('TC-STU-COMP-05 : addSkill -> 201', async () => {
        studentSkillService.addStudentSkill.mockResolvedValue({ id: 'skill-1', name: 'React' });

        const res = await request(app)
          .post('/api/students/me/skills')
          .set('Cookie', `accessToken=${studentToken}`)
          .send({ name: 'React' });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe('React');
        expect(studentSkillService.addStudentSkill).toHaveBeenCalledWith(1, { name: 'React' });
      });
    });

    describe('DELETE /me/skills/:studentSkillId', () => {
      it('TC-STU-COMP-06 : deleteSkill -> 200', async () => {
        studentSkillService.deleteStudentSkill.mockResolvedValue({ success: true });

        const res = await request(app)
          .delete('/api/students/me/skills/skill-1')
          .set('Cookie', `accessToken=${studentToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(studentSkillService.deleteStudentSkill).toHaveBeenCalledWith(1, 'skill-1');
      });
    });

  });

});
