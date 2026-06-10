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

jest.mock('../../../../src/services/student/githubImportService');
const studentGithubService = require('../../../../src/services/student/githubImportService');

const githubImportRouter = require('../../../../src/routes/student/githubImportRoutes');
const authMiddleware = require('../../../../src/middlewares/authMiddleware');
const checkRoles = require('../../../../src/middlewares/checkRoles');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/student', authMiddleware, checkRoles('STUDENT'), githubImportRouter);

const makeToken = (role = 'STUDENT', roleId = 40) =>
  jwt.sign(
    { userId: 1, role, roleId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );

const studentToken = makeToken();

beforeEach(() => jest.clearAllMocks());

describe("Tests d'Intégration - Routes GitHub Import Étudiant (githubImportRoutes)", () => {

  describe('Sécurité & Rôles', () => {

    it('TC-STU-GH-SEC-01 : Sans token -> 401', async () => {
      const res = await request(app).get('/api/student/github/auth');
      expect(res.status).toBe(401);
    });

    it('TC-STU-GH-SEC-02 : Professeur accède -> 403', async () => {
      const res = await request(app)
        .get('/api/student/github/auth')
        .set('Cookie', `accessToken=${makeToken('PROFESSOR')}`);
      expect(res.status).toBe(403);
    });

  });

  describe('Endpoints Logic', () => {

    it('TC-STU-GH-01 : getGithubAuthLink -> 200', async () => {
      studentGithubService.getStudentGithubAuthLink.mockResolvedValue({ url: 'https://github.com/login/oauth/authorize' });

      const res = await request(app)
        .get('/api/student/github/auth')
        .set('Cookie', `accessToken=${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.url).toBe('https://github.com/login/oauth/authorize');
      expect(studentGithubService.getStudentGithubAuthLink).toHaveBeenCalledWith(1);
    });

    it('TC-STU-GH-02 : getGithubStats -> 200', async () => {
      studentGithubService.getStudentGithubStats.mockResolvedValue({ username: 'najim', reposCount: 10 });

      const res = await request(app)
        .get('/api/student/github/stats')
        .set('Cookie', `accessToken=${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.username).toBe('najim');
      expect(studentGithubService.getStudentGithubStats).toHaveBeenCalledWith(1);
    });

    it('TC-STU-GH-03 : importGithubRepository -> 201', async () => {
      studentGithubService.importGithubRepository.mockResolvedValue({ id: 'project-1', title: 'My Repo' });

      const res = await request(app)
        .post('/api/student/github/import')
        .set('Cookie', `accessToken=${studentToken}`)
        .send({ repoUrl: 'https://github.com/najim/repo', name: 'My Repo' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('project-1');
      expect(studentGithubService.importGithubRepository).toHaveBeenCalledWith(1, {
        repoUrl: 'https://github.com/najim/repo',
        name: 'My Repo'
      });
    });

  });

});
