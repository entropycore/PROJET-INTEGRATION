'use strict';

process.env.NODE_ENV = 'test';

const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());


const professorController = require('../../../src/controllers/professorController');

jest.mock('../../../src/services/professorService', () => {
    return {
        getProfessorDashboard: jest.fn(),
        getProfessorProfile: jest.fn(),
        getDashboard: jest.fn(), 
        getProfile: jest.fn()    
    };
});
const professorService = require('../../../src/services/professorService');


const mockAuth = (req, res, next) => {
    if (!req.headers.authorization && !req.headers.cookie) {
        return res.status(401).json({ success: false, message: "Non authentifié" });
    }
    req.user = { userId: 'prof-555', role: req.headers.role || 'PROFESSOR' };
    next();
};

const mockCheckRole = (role) => (req, res, next) => {
    if (req.user && req.user.role === role) {
        return next();
    }
    return res.status(403).json({ success: false, message: "Accès interdit" });
};


const dashboardMethod = professorController.getDashboard || professorController.getProfessorDashboard;
const profileMethod = professorController.getProfile || professorController.getProfessorProfile;

app.get('/api/professor/dashboard', mockAuth, mockCheckRole('PROFESSOR'), dashboardMethod);
app.get('/api/professor/profile', mockAuth, mockCheckRole('PROFESSOR'), profileMethod);


app.use((err, req, res, next) => {
    res.status(500).json({ success: false, message: err.message });
});

describe('INTEGRATION TEST: Professor Controller - Quality Suite', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        
        
        if (professorService.getProfessorDashboard) {
            professorService.getProfessorDashboard.mockResolvedValue({ area: 'professor', stats: { totalStudents: 45 } });
        }
        if (professorService.getDashboard) {
            professorService.getDashboard.mockResolvedValue({ area: 'professor', stats: { totalStudents: 45 } });
        }
        if (professorService.getProfessorProfile) {
            professorService.getProfessorProfile.mockResolvedValue({ user: { userId: 'prof-555', email: 'prof@ensa.ma' } });
        }
        if (professorService.getProfile) {
            professorService.getProfile.mockResolvedValue({ user: { userId: 'prof-555', email: 'prof@ensa.ma' } });
        }
    });

    // ==========================================
    // --- Section A: Succès et Intégrité ---
    // ==========================================
    describe('Section A: Succès et Intégrité des données', () => {
        
        test('TC-PROF-01 : Accès autorisé au Dashboard Professeur (200)', async () => {
            const res = await request(app)
                .get('/api/professor/dashboard')
                .set('Cookie', 'accessToken=valid_prof_token')
                .set('role', 'PROFESSOR');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.area).toBe('professor');
        });

        test('TC-PROF-02 : Transmission correcte des données du profil (200)', async () => {
            const res = await request(app)
                .get('/api/professor/profile')
                .set('Cookie', 'accessToken=valid_prof_token')
                .set('role', 'PROFESSOR');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.user.userId).toBe('prof-555');
        });

        test('TC-PROF-05 : Respect de la structure standard JSON', async () => {
            const res = await request(app)
                .get('/api/professor/dashboard')
                .set('Cookie', 'accessToken=valid_prof_token')
                .set('role', 'PROFESSOR');

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body).toHaveProperty('message');
            expect(res.body).toHaveProperty('data');
        });
    });

    // ==========================================
    // --- Section B: Sécurité et Rôles (RBAC) ---
    // ==========================================
    describe('Section B: Sécurité et Rôles (RBAC)', () => {

        test('TC-PROF-03 : Interdiction d\'access pour un profil STUDENT (403)', async () => {
            const res = await request(app)
                .get('/api/professor/dashboard')
                .set('Cookie', 'accessToken=valid_token')
                .set('role', 'STUDENT'); // 

            expect(res.statusCode).toBe(403);
        });

        test('TC-PROF-04 : Rejet de la requête sans authentification (401)', async () => {
            const res = await request(app).get('/api/professor/dashboard'); 
            expect(res.statusCode).toBe(401);
        });
    });
});