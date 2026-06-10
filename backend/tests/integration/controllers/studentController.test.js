'use strict';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../../../src/server');

/**
 * MOCKING DYNAMIQUE
 * Utilisation du préfixe 'mock' pour respecter les règles de Jest
 */
let mockUser = { userId: 'stu-007', role: 'STUDENT' };

jest.mock('../../../src/middlewares/authMiddleware', () => (req, res, next) => {
    if (!mockUser) {
        return res.status(401).json({ success: false, message: "Non autorisé" });
    }
    req.user = mockUser;
    next();
});

jest.mock('../../../src/middlewares/checkRoles', () => (requiredRole) => (req, res, next) => {
    if (req.user && req.user.role === requiredRole) {
        return next();
    }
    return res.status(403).json({ success: false, message: "Accès interdit" });
});

jest.mock('../../../src/middlewares/redirectHttps', () => (req, res, next) => next());

describe('INTEGRATION TEST: Student Controller - Quality Suite', () => {

    beforeEach(() => {
        // Reset à un profil étudiant valide avant chaque test
        mockUser = { userId: 'stu-007', role: 'STUDENT' };
    });

    describe('Section A: Fonctionnalités Étudiant', () => {

        test('TC-STU-01 : Accès réussi au Dashboard Étudiant (200)', async () => {
            const res = await request(app).get('/api/student/dashboard');
            expect(res.statusCode).toBe(200);
            expect(res.body.data.area).toBe('student');
        });

        test('TC-STU-02 : Récupération fidèle des données du profil (200)', async () => {
            const res = await request(app).get('/api/student/profile');
            expect(res.statusCode).toBe(200);
            expect(res.body.data.user.userId).toBe('stu-007');
        });

        test('TC-STU-05 : Validation de la structure de réponse JSON', async () => {
            const res = await request(app).get('/api/student/dashboard');
            expect(res.body).toHaveProperty('success', true);
            expect(res.body).toHaveProperty('data');
        });
    });

    describe('Section B: Sécurité et Isolation (RBAC)', () => {

        test('TC-STU-03 : Blocage d\'un utilisateur avec rôle PROFESSOR (403)', async () => {
            // Changement du rôle pour simuler une intrusion
            mockUser = { userId: 'prof-123', role: 'PROFESSOR' };
            const res = await request(app).get('/api/student/dashboard');
            expect(res.statusCode).toBe(403);
        });

        test('TC-STU-04 : Rejet des requêtes anonymes sans token (401)', async () => {
            mockUser = null;
            const res = await request(app).get('/api/student/dashboard');
            expect(res.statusCode).toBe(401);
        });
    });
});