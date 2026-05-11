'use strict';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../../../src/server');

/**
 * CORRECTION: On utilise obligatoirement le préfixe 'mock' 
 * pour les variables utilisées dans jest.mock()
 */
let mockUser = { userId: 'prof-555', role: 'PROFESSOR' };

jest.mock('../../../src/middlewares/authMiddleware', () => (req, res, next) => {
    // Jest autorise l'accès à 'mockUser' car il commence par 'mock'
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

describe('INTEGRATION TEST: Professor Controller - Quality Suite', () => {

    beforeEach(() => {
        // Reset de l'utilisateur mocké avant chaque test
        mockUser = { userId: 'prof-555', role: 'PROFESSOR' };
    });

    describe('Section A: Succès et Intégrité des données', () => {

        test('TC-PROF-01 : Accès autorisé au Dashboard Professeur (200)', async () => {
            const res = await request(app).get('/api/professor/dashboard');
            expect(res.statusCode).toBe(200);
            expect(res.body.data.area).toBe('professor');
        });

        test('TC-PROF-02 : Transmission correcte des données du profil (200)', async () => {
            const res = await request(app).get('/api/professor/profile');
            expect(res.statusCode).toBe(200);
            expect(res.body.data.user.userId).toBe('prof-555');
        });

        test('TC-PROF-05 : Respect de la structure standard JSON', async () => {
            const res = await request(app).get('/api/professor/dashboard');
            expect(res.body).toHaveProperty('success', true);
            expect(res.body).toHaveProperty('message');
            expect(res.body).toHaveProperty('data');
        });
    });

    describe('Section B: Sécurité et Rôles (RBAC)', () => {

        test('TC-PROF-03 : Interdiction d\'accès pour un profil STUDENT (403)', async () => {
            // Modification du mockUser pour simuler un étudiant
            mockUser = { userId: 'student-001', role: 'STUDENT' };
            const res = await request(app).get('/api/professor/dashboard');
            expect(res.statusCode).toBe(403);
        });

        test('TC-PROF-04 : Rejet de la requête sans authentification (401)', async () => {
            // Simulation de l'absence d'utilisateur
            mockUser = null;
            const res = await request(app).get('/api/professor/dashboard');
            expect(res.statusCode).toBe(401);
        });
    });
});