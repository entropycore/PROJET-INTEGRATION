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

jest.mock('../../../../src/services/student/skillService');
const studentSkillService = require('../../../../src/services/student/skillService');

const skillRouter = require('../../../../src/routes/student/skillRoutes');
const authMiddleware = require('../../../../src/middlewares/authMiddleware');
const checkRoles = require('../../../../src/middlewares/checkRoles');

const app = WebAppInstance = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/student', authMiddleware, checkRoles('STUDENT'), skillRouter);

const makeToken = (role = 'STUDENT', roleId = 40) =>
  jwt.sign(
    { userId: 1, role, roleId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );

const studentToken = makeToken();

beforeEach(() => jest.clearAllMocks());

describe("Tests d'Intégration - Routes Skills Étudiant (skillRoutes)", () => {

  describe('Sécurité & Rôles', () => {

    it('TC-STU-SKILL-SEC-01 : Sans token -> 401', async () => {
      const res = await request(WebAppInstance).get('/api/student/skills/stats');
      expect(res.status).toBe(401);
    });

    it('TC-STU-SKILL-SEC-02 : Professeur accède -> 403', async () => {
      const res = await request(WebAppInstance)
        .get('/api/student/skills/stats')
        .set('Cookie', `accessToken=${makeToken('PROFESSOR')}`);
      expect(res.status).toBe(403);
    });

  });

  describe('Endpoints Logic', () => {

    it('TC-STU-SKILL-01 : getSkillStats -> 200', async () => {
      studentSkillService.getStudentSkillStats.mockResolvedValue({ totalSkills: 5 });

      const res = await request(WebAppInstance)
        .get('/api/student/skills/stats')
        .set('Cookie', `accessToken=${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalSkills).toBe(5);
      expect(studentSkillService.getStudentSkillStats).toHaveBeenCalledWith(1);
    });

    it('TC-STU-SKILL-02 : getSoftSkills -> 200', async () => {
      studentSkillService.getStudentSoftSkills.mockResolvedValue([{ id: 'soft-1', name: 'Communication' }]);

      const res = await request(WebAppInstance)
        .get('/api/student/soft-skills')
        .set('Cookie', `accessToken=${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(studentSkillService.getStudentSoftSkills).toHaveBeenCalledWith(1);
    });

    it('TC-STU-SKILL-03 : addSoftSkill -> 201', async () => {
      studentSkillService.addStudentSoftSkill.mockResolvedValue({ id: 'soft-1', name: 'Leadership' });

      const res = await request(WebAppInstance)
        .post('/api/student/soft-skills')
        .set('Cookie', `accessToken=${studentToken}`)
        .send({ name: 'Leadership' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Leadership');
      expect(studentSkillService.addStudentSoftSkill).toHaveBeenCalledWith(1, { name: 'Leadership' });
    });

    it('TC-STU-SKILL-04 : deleteSoftSkill -> 200', async () => {
      studentSkillService.deleteStudentSoftSkill.mockResolvedValue({ success: true });

      const res = await request(WebAppInstance)
        .delete('/api/student/soft-skills/soft-1')
        .set('Cookie', `accessToken=${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(studentSkillService.deleteStudentSoftSkill).toHaveBeenCalledWith(1, 'soft-1');
    });

  });

});
