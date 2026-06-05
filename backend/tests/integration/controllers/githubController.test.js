'use strict';

const request = require('supertest');
const app = require('../../../src/server');
const prisma = require('../../../src/config/prisma');
const jwt = require('jsonwebtoken');

// 1. Mocking the GitHub Service to avoid real HTTP calls to GitHub API
jest.mock('../../../src/services/githubService', () => ({
    getAccessToken: jest.fn(),
    saveGithubToken: jest.fn(),
    fetchStudentStats: jest.fn()
}));

const githubService = require('../../../src/services/githubService');

describe('INTEGRATION TESTS - GITHUB INTEGRATION', () => {
    let cookieHeader;
    let studentUser;
    let studentProfile;

    beforeAll(async () => {
        const timestamp = Date.now();

        // Create a real Student User in DB for Foreign Key integrity
        studentUser = await prisma.user.create({
            data: {
                email: `github.qa.${timestamp}@ensa.ac.ma`,
                passwordHash: 'hashed_password_123',
                firstName: 'Najim',
                lastName: 'QA',
                role: 'STUDENT',
                accountStatus: 'ACTIVE'
            }
        });

        studentProfile = await prisma.student.create({
            data: {
                userId: studentUser.id,
                major: 'Génie Informatique',
                level: 'CI1'
            }
        });

        // Generate a valid Access Token for Auth middleware
        const accessToken = jwt.sign(
            { userId: studentUser.id, role: 'STUDENT' },
            process.env.ACCESS_TOKEN_SECRET || 'your_access_token_secret',
            { expiresIn: '15m' }
        );

        cookieHeader = `accessToken=${accessToken}`;
    });

    afterAll(async () => {
        // Cleanup the database after tests execute
        await prisma.project.deleteMany({ where: { studentId: studentProfile.id } });
        await prisma.student.delete({ where: { id: studentProfile.id } });
        await prisma.user.delete({ where: { id: studentUser.id } });
        await prisma.$disconnect();
    });

    // ─── 1. TEST CASES FOR GET /auth ──────────────────────────────────────────
    describe('GET /api/student/github/auth', () => {
        test('TC-GH-AUTH-01 : Successful redirection URL generation', async () => {
            const res = await request(app)
                .get('/api/student/github/auth')
                .set('Cookie', cookieHeader);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.url).toContain('github.com/login/oauth/authorize');
            expect(res.body.data.url).toContain(`state=${studentUser.id}`); // Checks if state parameter holds the userId
        });
    });

    // ─── 2. TEST CASES FOR GET /callback ──────────────────────────────────────
    describe('GET /api/student/github/callback', () => {
        test('TC-GH-CALL-01 : Successful OAuth callback and token storage', async () => {
            // Mocking the service to return a fake token successfully
            githubService.getAccessToken.mockResolvedValue('fake_github_access_token_abc123');
            githubService.saveGithubToken.mockResolvedValue(true);

            const res = await request(app)
                .get('/api/student/github/callback')
                .query({ code: 'valid_github_code', state: studentUser.id });

            // Should redirect to Frontend with success status
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe('http://localhost:5173/student/github?status=success');
        });

        test('TC-GH-CALL-02 : Missing parameters should redirect with error status', async () => {
            const res = await request(app)
                .get('/api/student/github/callback')
                .query({ state: studentUser.id }); // Missing the 'code' parameter

            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe('http://localhost:5173/student/github?status=error');
        });
    });

    // ─── 3. TEST CASES FOR GET /stats ─────────────────────────────────────────
    describe('GET /api/student/github/stats', () => {
        test('TC-GH-STAT-01 : Return stats when connected to GitHub', async () => {
            // Step 1: Add token to student profile to simulate connection
            await prisma.student.update({
                where: { id: studentProfile.id },
                data: { githubAccessToken: 'active_token' }
            });

            // Step 2: Mock service response for statistics
            const mockStats = { reposCount: 15, totalCommits: 340, primaryLanguage: 'JavaScript' };
            githubService.fetchStudentStats.mockResolvedValue(mockStats);

            const res = await request(app)
                .get('/api/student/github/stats')
                .set('Cookie', cookieHeader);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.connected).toBe(true);
            expect(res.body.data.totalCommits).toBe(340);
        });

        test('TC-GH-STAT-02 : Return connected false if no token in database', async () => {
            // Remove token to simulate disconnection
            await prisma.student.update({
                where: { id: studentProfile.id },
                data: { githubAccessToken: null }
            });

            const res = await request(app)
                .get('/api/student/github/stats')
                .set('Cookie', cookieHeader);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.connected).toBe(false);
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
            const res = await request(app)
                .post('/api/student/github/import')
                .set('Cookie', cookieHeader)
                .send(projectPayload);

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.project.title).toBe(projectPayload.repoName);
            expect(res.body.data.project.type).toBe('PERSONAL');
            expect(res.body.data.project.visibility).toBe('PRIVATE');
        });

        test('TC-GH-IMP-02 : Re-importing the same project should return a 400 bad request', async () => {
            // Sending the same repository URL again
            const res = await request(app)
                .post('/api/student/github/import')
                .set('Cookie', cookieHeader)
                .send(projectPayload);

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/déjà dans votre portfolio/i);
        });
    });
});