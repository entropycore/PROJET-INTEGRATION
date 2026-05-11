'use strict';
/**
 * Configuration de l'environnement de test
 * On bloque le démarrage du serveur réel pour isoler les tests.
 */
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../../../src/server');

/**
 * MOCKING DES MIDDLEWARES
 * On simule l'authentification et le contrôle de rôle.
 */
let mockUser = { userId: 'pro-123', role: 'PROFESSIONAL' };

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

describe('INTEGRATION TEST: Professional Controller - Full QA Suite', () => {

    beforeEach(() => {
        // On réinitialise l'utilisateur mocké avant chaque test
        mockUser = { userId: 'pro-123', role: 'PROFESSIONAL' };
    });

    // --- 1. SUCCESS TESTS (Happy Path) ---
    describe('Section A: Succès et Logique Métier', () => {
        
        test('TC-PRO-01 : Accès réussi au Dashboard (200)', async () => {
            // BUT: Vérifier que le contrôleur renvoie la zone correcte
            const res = await request(app).get('/api/professional/dashboard');
            expect(res.statusCode).toBe(200);
            expect(res.body.data.area).toBe('professional');
        });

        test('TC-PRO-02 : Récupération du profil (200)', async () => {
            // BUT: Vérifier la transmission des données utilisateur
            const res = await request(app).get('/api/professional/profile');
            expect(res.statusCode).toBe(200);
            expect(res.body.data.user.userId).toBe('pro-123');
        });

        test('TC-PRO-03 : Format standard de la réponse (Structure)', async () => {
            // BUT: Garantir la cohérence pour le Frontend (Contract Testing)
            const res = await request(app).get('/api/professional/dashboard');
            expect(res.body).toHaveProperty('success', true);
            expect(res.body).toHaveProperty('message');
            expect(res.body).toHaveProperty('data');
        });
    });

    // --- 2. SECURITY TESTS (RBAC & Auth) ---
    describe('Section B: Sécurité et Contrôle d\'accès', () => {

        test('TC-PRO-04 : Accès interdit pour un rôle non autorisé - STUDENT (403)', async () => {
            // BUT: Vérifier que le middleware de rôle bloque les accès illégitimes
            mockUser = { userId: 'student-456', role: 'STUDENT' };

            const res = await request(app).get('/api/professional/dashboard');
            expect(res.statusCode).toBe(403);
            expect(res.body.message).toMatch(/Accès interdit/i);
        });

        test('TC-PRO-05 : Accès refusé sans authentification (401)', async () => {
            // BUT: Simuler l'absence de token ou session
            mockUser = null;

            const res = await request(app).get('/api/professional/dashboard');
            expect(res.statusCode).toBe(401);
        });
    });
});