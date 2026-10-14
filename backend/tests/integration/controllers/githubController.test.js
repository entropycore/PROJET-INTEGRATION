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

// Mock the correct githubImportService path
jest.mock('../../../src/services/student/githubImportService');
const githubImportService = require('../../../src/services/student/githubImportService');

const githubImportRouter = require('../../../src/routes/student/githubImportRoutes');
const githubImportController = require('../../../src/controllers/student/githubImportController');
const authMiddleware = require('../../../src/middlewares/authMiddleware');
const checkRoles = require('../../../src/middlewares/checkRoles');

const app = express();
app.use(express.json());
app.use(cookieParser());

// Public callback route
app.get('/api/student/github/callback', githubImportController.handleGithubCallback);

// Protected routes
app.use('/api/student', authMiddleware, checkRoles('STUDENT'), githubImportRouter);

const makeToken = (role = 'STUDENT', roleId = 40) =>
    jwt.sign(
        { userId: 1, role, roleId },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' }
    );

const studentToken = makeToken();

describe('INTEGRATION TESTS - GITHUB INTEGRATION', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ─── 1. TEST CASES FOR GET /auth ──────────────────────────────────────────
    describe('GET /api/student/github/auth', () => {
        test('TC-GH-AUTH-01 : Successful redirection URL generation', async () => {
            githubImportService.getStudentGithubAuthLink.mockResolvedValue({
                url: 'https://github.com/login/oauth/authorize?client_id=123&state=1'
            });

            const res = await request(app)
                .get('/api/student/github/auth')
                .set('Cookie', `accessToken=${studentToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.url).toContain('github.com/login/oauth/authorize');
            expect(res.body.data.url).toContain('state=1');
            expect(githubImportService.getStudentGithubAuthLink).toHaveBeenCalledWith(1);
        });
    });

    // ─── 2. TEST CASES FOR GET /callback ──────────────────────────────────────
    describe('GET /api/student/github/callback', () => {
        test('TC-GH-CALL-01 : Successful OAuth callback and token storage', async () => {
            githubImportService.handleGithubCallback.mockResolvedValue();

            const res = await request(app)
                .get('/api/student/github/callback')
                .query({ code: 'valid_github_code', state: '1' });

            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe('http://localhost:5173/student/github?status=success');
            expect(githubImportService.handleGithubCallback).toHaveBeenCalledWith({
                code: 'valid_github_code',
                state: '1'
            });
        });

        test('TC-GH-CALL-02 : Missing parameters should redirect with error status', async () => {
            githubImportService.handleGithubCallback.mockRejectedValue(new Error('GITHUB_CALLBACK_INVALID'));

            const res = await request(app)
                .get('/api/student/github/callback')
                .query({ state: '1' }); // Missing 'code'

            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe('http://localhost:5173/student/github?status=error');
        });
    });

    // ─── 3. TEST CASES FOR GET /stats ─────────────────────────────────────────
    describe('GET /api/student/github/stats', () => {
        test('TC-GH-STAT-01 : Return stats when connected to GitHub', async () => {
            const mockStats = { connected: true, reposCount: 15, totalCommits: 340, primaryLanguage: 'JavaScript' };
            githubImportService.getStudentGithubStats.mockResolvedValue(mockStats);

            const res = await request(app)
                .get('/api/student/github/stats')
                .set('Cookie', `accessToken=${studentToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.connected).toBe(true);
            expect(res.body.data.totalCommits).toBe(340);
            expect(githubImportService.getStudentGithubStats).toHaveBeenCalledWith(1);
        });

        test('TC-GH-STAT-02 : Return connected false if no token in database', async () => {
            githubImportService.getStudentGithubStats.mockResolvedValue({ connected: false });

            const res = await request(app)
                .get('/api/student/github/stats')
                .set('Cookie', `accessToken=${studentToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.connected).toBe(false);
            expect(githubImportService.getStudentGithubStats).toHaveBeenCalledWith(1);
        });
    });

    // ─── 4. TEST CASES FOR POST /import ───────────────────────────────
    describe('POST /api/student/github/import', () => {
        const projectPayload = {
            repoName: 'E-Portfolio ENSAT',
            repoDescription: 'Academic Node.js Backend Project',
            repoUrl: 'https://github.com/najim/e-portfolio-backend',
            repoLanguage: 'JavaScript'
        };

        test('TC-GH-IMP-01 : Import a new project successfully', async () => {
            githubImportService.importGithubRepository.mockResolvedValue({
                project: {
                    title: 'E-Portfolio ENSAT',
                    type: 'PERSONAL',
                    visibility: 'PRIVATE'
                }
            });

            const res = await request(app)
                .post('/api/student/github/import')
                .set('Cookie', `accessToken=${studentToken}`)
                .send(projectPayload);

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.project.title).toBe(projectPayload.repoName);
            expect(res.body.data.project.type).toBe('PERSONAL');
            expect(res.body.data.project.visibility).toBe('PRIVATE');
            expect(githubImportService.importGithubRepository).toHaveBeenCalledWith(1, projectPayload);
        });

        test('TC-GH-IMP-02 : Re-importing the same project should return a 409 conflict request', async () => {
            githubImportService.importGithubRepository.mockRejectedValue(new Error('GITHUB_REPOSITORY_ALREADY_IMPORTED'));

            const res = await request(app)
                .post('/api/student/github/import')
                .set('Cookie', `accessToken=${studentToken}`)
                .send(projectPayload);

            expect(res.statusCode).toBe(409);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/déjà dans votre portfolio/i);
        });
    });
});