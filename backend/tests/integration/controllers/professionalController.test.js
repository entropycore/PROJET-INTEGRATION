'use strict';

process.env.NODE_ENV = 'test';

const request = require('supertest');
const express = require('express');


const app = express();
app.use(express.json());


const professionalController = require('../../../src/controllers/professionalController');


jest.mock('../../../src/services/professionalService', () => {
    return {
        getProfessionalDashboard: jest.fn(),
        getProfessionalProfile: jest.fn()
    };
});
const professionalService = require('../../../src/services/professionalService');


const mockAuth = (req, res, next) => {
    if (!req.headers.authorization && !req.headers.cookie) {
        return res.status(401).json({ success: false, message: "Non authentifié" });
    }
    req.user = { userId: 'pro-123', role: req.headers.role || 'PROFESSIONAL' };
    next();
};

const mockCheckRole = (role) => (req, res, next) => {
    if (req.user && req.user.role === role) {
        return next();
    }
    return res.status(403).json({ success: false, message: "Accès interdit" });
};


app.get('/api/professionals/dashboard', mockAuth, mockCheckRole('PROFESSIONAL'), professionalController.getDashboard);
app.get('/api/professionals/profile', mockAuth, mockCheckRole('PROFESSIONAL'), professionalController.getProfile);


app.use((err, req, res, next) => {
    res.status(500).json({ success: false, message: err.message });
});

describe('INTEGRATION TEST: Professional Controller - Full QA Suite', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ==========================================
    // --- Section A: Succès et Logique Métier ---
    // ==========================================
    describe('Section A: Succès et Logique Métier', () => {
        
        test('TC-PRO-01 : Accès réussi au Dashboard (200)', async () => {
            professionalService.getProfessionalDashboard.mockResolvedValue({ area: 'professional', stats: { totalProjects: 3 } });

            const res = await request(app)
                .get('/api/professionals/dashboard')
                .set('Cookie', 'accessToken=valid')
                .set('role', 'PROFESSIONAL');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.area).toBe('professional');
        });

        test('TC-PRO-02 : Récupération du profil (200)', async () => {
            professionalService.getProfessionalProfile.mockResolvedValue({ user: { userId: 'pro-123', email: 'pro@ensa.ma' } });

            const res = await request(app)
                .get('/api/professionals/profile')
                .set('Cookie', 'accessToken=valid')
                .set('role', 'PROFESSIONAL');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.user.userId).toBe('pro-123');
        });

        test('TC-PRO-03 : Format standard de la réponse (Structure)', async () => {
            professionalService.getProfessionalDashboard.mockResolvedValue({ area: 'professional' });

            const res = await request(app)
                .get('/api/professionals/dashboard')
                .set('Cookie', 'accessToken=valid')
                .set('role', 'PROFESSIONAL');

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body).toHaveProperty('message');
            expect(res.body).toHaveProperty('data');
        });
    });

    // ==========================================
    // --- Section B: Sécurité et Contrôle d'accès ---
    // ==========================================
    describe('Section B: Sécurité et Contrôle d\'accès', () => {

        test('TC-PRO-04 : Accès interdit pour un rôle non autorisé - STUDENT (403)', async () => {
            const res = await request(app)
                .get('/api/professionals/dashboard')
                .set('Cookie', 'accessToken=valid')
                .set('role', 'STUDENT'); 

            expect(res.statusCode).toBe(403); 
        });

        test('TC-PRO-05 : Accès refusé sans authentification (401)', async () => {
            const res = await request(app).get('/api/professionals/dashboard'); 
            expect(res.statusCode).toBe(401);
        });
    });
});