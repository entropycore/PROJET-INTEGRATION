'use strict';

/**
 * Configuration de l'environnement de test
 * On force NODE_ENV à 'test' pour désactiver le démarrage automatique du serveur
 */
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../../../src/server'); // Import de l'application Express
const authService = require('../../../src/services/authService');

/**
 * MOCKING DES SERVICES
 * On remplace le service réel par des fonctions simulées pour isoler le contrôleur
 */
jest.mock('../../../src/services/authService');
jest.mock('../../../src/middlewares/redirectHttps', () => (req, res, next) => next());
jest.mock('../../../src/middlewares/verifyRefreshToken', () => (req, res, next) => {
    req.user = { userId: 'test-qa-id' }; 
    next();
});

describe('INTEGRATION TEST: Auth Controller - Quality Assurance Suite', () => {

    // --- A. Register & Verification ---
    describe('Section A: Inscription et Vérification', () => {
        
        // TC-AUTH-01 (Success)
        test('TC-AUTH-01 : Inscription réussie d\'un professionnel (201)', async () => {
            authService.registerProfessional.mockResolvedValue({ success: true });

            const res = await request(app)
                .post('/api/auth/register')
                .send({ email: 'najim.qa@ensa.ma', password: 'Password123!', firstName: 'Najim', lastName: 'QA' });

            expect(res.statusCode).toBe(201); // Succès de création
            expect(res.body.message).toMatch(/Vérifiez votre email/i);
        });

        // TC-AUTH-02 (Conflict)
        test('TC-AUTH-02 : Rejet si l\'email est déjà utilisé (400)', async () => {
            authService.registerProfessional.mockRejectedValue(new Error('EMAIL_ALREADY_EXISTS'));

            const res = await request(app)
                .post('/api/auth/register')
                .send({ 
                    email: 'existing@ensa.ma', 
                    password: 'Password123!',
                    firstName: 'Najim', 
                    lastName: 'QA' 
                });

            expect(res.statusCode).toBe(400); // Erreur client : conflit
            expect(res.body.message).toMatch(/déjà utilisé/i);
        });

        // TC-AUTH-03 (Security)
        test('TC-AUTH-03 : Vérification email avec Token invalide (400)', async () => {
            authService.verifyEmailToken.mockRejectedValue(new Error('INVALID_TOKEN'));

            const res = await request(app).get('/api/auth/verify-email?token=token_errone');

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/Lien invalide/i);
        });
    });

    // --- B. Login & Security (RBAC) ---
    describe('Section B: Authentification et Contrôle d\'accès', () => {

        // TC-AUTH-04 (Failure)
        test('TC-AUTH-04 : Échec de connexion - Mot de passe incorrect (401)', async () => {
            authService.loginUser.mockRejectedValue(new Error('INVALID_CREDENTIALS'));

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'najim@ensa.ma', password: 'WrongPassword' });

            expect(res.statusCode).toBe(401); // Non autorisé
        });

        // TC-AUTH-05 (Blocking)
        test('TC-AUTH-05 : Blocage - Email non vérifié (403)', async () => {
            authService.loginUser.mockRejectedValue(new Error('EMAIL_NOT_VERIFIED'));

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'unverified@ensa.ma', password: 'Password123' });

            expect(res.statusCode).toBe(403); // Interdit tant que non vérifié
            expect(res.body.message).toMatch(/vérifier votre email/i);
        });

        // TC-AUTH-06 (Pending)
        test('TC-AUTH-06 : Blocage - Compte pro en attente de validation Admin (403)', async () => {
            authService.loginUser.mockRejectedValue(new Error('ACCOUNT_PENDING_APPROVAL'));

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'pro@job.ma', password: 'Password123' });

            expect(res.statusCode).toBe(403);
            expect(res.body.message).toMatch(/validation/i);
        });

        // TC-AUTH-07 (Data)
        test('TC-AUTH-07 : Retour du rôle utilisateur après login (200)', async () => {
            authService.loginUser.mockResolvedValue({ 
                role: 'STUDENT', accessToken: 'at', refreshToken: 'rt' 
            });

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'student@ensa.ma', password: 'Password123' });

            expect(res.statusCode).toBe(200);
            expect(res.body.role).toBe('STUDENT'); // Important pour le routage frontend
        });
    });

    // --- C. Token Management ---
    describe('Section C: Gestion des Sessions et Tokens', () => {

        // TC-AUTH-08 (Refresh)
        test('TC-AUTH-08 : Renouvellement de l\'Access Token (200)', async () => {
            authService.refreshUserToken.mockResolvedValue('new_access_token');

            const res = await request(app)
                .post('/api/auth/refresh-token')
                .set('Cookie', ['refreshToken=valid_rt']);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toMatch(/renouvelé/i);
        });

        // TC-AUTH-09 (Revocation)
        test('TC-AUTH-09 : Échec du Refresh - Token expiré ou révoqué (401)', async () => {
            authService.refreshUserToken.mockRejectedValue(new Error('REFRESH_TOKEN_EXPIRED'));

            const res = await request(app)
                .post('/api/auth/refresh-token')
                .set('Cookie', ['refreshToken=expired_rt']);

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toMatch(/expiré/i);
        });
    });

    // --- D. Edge Cases ---
    describe('Section D: Cas Limites et Sécurité Middleware', () => {

        // TC-AUTH-10 (Middleware)
        test('TC-AUTH-10 : Rejet de /getMe sans Token d\'authentification (401)', async () => {
            const res = await request(app).get('/api/auth/me');
            expect(res.statusCode).toBe(401); // Le middleware Auth doit bloquer ici
        });

        // TC-AUTH-11 (Inactive)
        test('TC-AUTH-11 : Blocage du Refresh pour un compte inactif/suspendu (403)', async () => {
            authService.refreshUserToken.mockRejectedValue(new Error('ACCOUNT_INACTIVE'));

            const res = await request(app)
                .post('/api/auth/refresh-token')
                .set('Cookie', ['refreshToken=some_rt']);

            expect(res.statusCode).toBe(403);
            expect(res.body.message).toMatch(/inactif/i);
        });
    });
});