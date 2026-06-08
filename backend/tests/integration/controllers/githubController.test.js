'use strict';

const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../../src/services/student/githubImportService', () => ({
  getStudentGithubAuthLink: jest.fn(),
  handleGithubCallback: jest.fn(),
  getStudentGithubStats: jest.fn(),
  importGithubRepository: jest.fn(),
}));

const app = require('../../../src/server');
const prisma = require('../../../src/config/prisma');
const githubService = require('../../../src/services/student/githubImportService');

describe('INTEGRATION TESTS - GITHUB INTEGRATION', () => {
  let cookieHeader;
  let studentUser;
  let studentProfile;

  beforeAll(async () => {
    const timestamp = Date.now();

    studentUser = await prisma.user.create({
      data: {
        email: `github.qa.${timestamp}@ensa.ac.ma`,
        passwordHash: 'hashed_password_123',
        firstName: 'Najim',
        lastName: 'QA',
        role: 'STUDENT',
        accountStatus: 'ACTIVE',
      },
    });

    studentProfile = await prisma.student.create({
      data: {
        userId: studentUser.id,
        major: 'Genie Informatique',
        level: 'CI1',
      },
    });

    const accessToken = jwt.sign(
      { userId: studentUser.id, role: 'STUDENT' },
      process.env.ACCESS_TOKEN_SECRET || 'your_access_token_secret',
      { expiresIn: '15m' },
    );

    cookieHeader = `accessToken=${accessToken}`;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await prisma.project.deleteMany({ where: { studentId: studentProfile.id } });
    await prisma.student.delete({ where: { id: studentProfile.id } });
    await prisma.user.delete({ where: { id: studentUser.id } });
    await prisma.$disconnect();
  });

  describe('GET /api/student/github/auth', () => {
    test('TC-GH-AUTH-01 : Successful redirection URL generation', async () => {
      githubService.getStudentGithubAuthLink.mockResolvedValue({
        url: `https://github.com/login/oauth/authorize?state=${studentUser.id}`,
      });

      const res = await request(app)
        .get('/api/student/github/auth')
        .set('Cookie', cookieHeader);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.url).toContain('github.com/login/oauth/authorize');
      expect(res.body.data.url).toContain(`state=${studentUser.id}`);
    });
  });

  describe('GET /api/student/github/callback', () => {
    test('TC-GH-CALL-01 : Successful OAuth callback and token storage', async () => {
      githubService.handleGithubCallback.mockResolvedValue(true);

      const res = await request(app)
        .get('/api/student/github/callback')
        .query({ code: 'valid_github_code', state: studentUser.id });

      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe('http://localhost:5173/student/github?status=success');
      expect(githubService.handleGithubCallback).toHaveBeenCalledWith({
        code: 'valid_github_code',
        state: studentUser.id,
      });
    });

    test('TC-GH-CALL-02 : Missing parameters should redirect with error status', async () => {
      githubService.handleGithubCallback.mockRejectedValue(new Error('GITHUB_CALLBACK_INVALID'));

      const res = await request(app)
        .get('/api/student/github/callback')
        .query({ state: studentUser.id });

      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe('http://localhost:5173/student/github?status=error');
    });
  });

  describe('GET /api/student/github/stats', () => {
    test('TC-GH-STAT-01 : Return stats when connected to GitHub', async () => {
      githubService.getStudentGithubStats.mockResolvedValue({
        connected: true,
        totalContributions: 340,
        repositories: [],
        languages: ['JavaScript'],
      });

      const res = await request(app)
        .get('/api/student/github/stats')
        .set('Cookie', cookieHeader);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.connected).toBe(true);
      expect(res.body.data.totalContributions).toBe(340);
    });

    test('TC-GH-STAT-02 : Return connected false if no token in database', async () => {
      githubService.getStudentGithubStats.mockResolvedValue({
        connected: false,
        repositories: [],
        languages: [],
        totalContributions: 0,
      });

      const res = await request(app)
        .get('/api/student/github/stats')
        .set('Cookie', cookieHeader);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.connected).toBe(false);
    });
  });

  describe('POST /api/student/github/import', () => {
    const projectPayload = {
      repoName: 'E-Portfolio ENSAT',
      repoDescription: 'Academic Node.js Backend Project',
      repoUrl: 'https://github.com/najim/e-portfolio-backend',
      repoLanguage: 'JavaScript',
    };

    test('TC-GH-IMP-01 : Import a new project successfully', async () => {
      githubService.importGithubRepository.mockResolvedValue({
        id: 'project-1',
        title: projectPayload.repoName,
        type: 'PERSONAL',
        visibility: 'PRIVATE',
      });

      const res = await request(app)
        .post('/api/student/github/import')
        .set('Cookie', cookieHeader)
        .send(projectPayload);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(projectPayload.repoName);
      expect(res.body.data.type).toBe('PERSONAL');
      expect(res.body.data.visibility).toBe('PRIVATE');
    });

    test('TC-GH-IMP-02 : Re-importing the same project should return a conflict', async () => {
      githubService.importGithubRepository.mockRejectedValue(
        new Error('GITHUB_REPOSITORY_ALREADY_IMPORTED'),
      );

      const res = await request(app)
        .post('/api/student/github/import')
        .set('Cookie', cookieHeader)
        .send(projectPayload);

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      const message = res.body.message.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      expect(message).toMatch(/depot GitHub est deja/i);
    });
  });
});
