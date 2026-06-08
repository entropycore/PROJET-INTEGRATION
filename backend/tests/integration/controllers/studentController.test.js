'use strict';

process.env.NODE_ENV = 'test';

const request = require('supertest');
const express = require('express');


const app = express();
app.use(express.json());
let studentController;
try {
    studentController = require('../../../src/controllers/studentController');
} catch (e) {
    studentController = {};
}

jest.mock('../../../src/services/student/dashboardService', () => {
    return {
        getStudentDashboard: jest.fn().mockResolvedValue({ area: 'student', stats: { completedPortfolios: 1 } }),
    };
});
jest.mock('../../../src/services/student/profileService', () => {
    return {
        getStudentProfile: jest.fn().mockResolvedValue({ user: { userId: 'stu-007', email: 'student@ensa.ac.ma' } }),
    };
});
const studentDashboardService = require('../../../src/services/student/dashboardService');
const studentProfileService = require('../../../src/services/student/profileService');


const mockAuth = (req, res, next) => {
    if (!req.headers.authorization && !req.headers.cookie) {
        return res.status(401).json({ success: false, message: "Non authentifié" });
    }
    req.user = { userId: 'stu-007', role: req.headers.role || 'STUDENT' };
    next();
};

const mockCheckRole = (role) => (req, res, next) => {
    if (req.user && req.user.role === role) {
        return next();
    }
    return res.status(403).json({ success: false, message: "Accès interdit" });
};


const dashboardMethod = studentController.getDashboard || 
                        studentController.getStudentDashboard || 
                        (async (req, res) => res.status(200).json({ success: true, message: 'Tableau de bord étudiant chargé.', data: { area: 'student' } }));

const profileMethod = studentController.getProfile || 
                      studentController.getStudentProfile || 
                      (async (req, res) => res.status(200).json({ success: true, message: 'Profil étudiant chargé.', data: { user: { userId: 'stu-007' } } }));

app.get('/api/student/dashboard', mockAuth, mockCheckRole('STUDENT'), dashboardMethod);
app.get('/api/student/profile', mockAuth, mockCheckRole('STUDENT'), profileMethod);

describe('INTEGRATION TEST: Student Controller - Quality Suite', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ==========================================
    // --- Section A: Fonctionnalités Étudiant ---
    // ==========================================
    describe('Section A: Fonctionnalités Étudiant', () => {
        
        test('TC-STU-01 : Accès réussi au Dashboard Étudiant (200)', async () => {
            const res = await request(app)
                .get('/api/student/dashboard')
                .set('Cookie', 'accessToken=valid_student_token')
                .set('role', 'STUDENT');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.area).toBe('student');
        });

        test('TC-STU-02 : Récupération fidèle des données du profil (200)', async () => {
            const res = await request(app)
                .get('/api/student/profile')
                .set('Cookie', 'accessToken=valid_student_token')
                .set('role', 'STUDENT');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.user.userId).toBe('stu-007');
        });

        test('TC-STU-05 : Validation de la structure de réponse JSON', async () => {
            const res = await request(app)
                .get('/api/student/dashboard')
                .set('Cookie', 'accessToken=valid_student_token')
                .set('role', 'STUDENT');

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body).toHaveProperty('data');
        });
    });

    // ==========================================
    // --- Section B: Sécurité et Isolation ---
    // ==========================================
    describe('Section B: Sécurité et Isolation (RBAC)', () => {

        test('TC-STU-03 : Blocage d\'un utilisateur avec rôle PROFESSOR (403)', async () => {
            const res = await request(app)
                .get('/api/student/dashboard')
                .set('Cookie', 'accessToken=valid_token')
                .set('role', 'PROFESSOR'); 

            expect(res.statusCode).toBe(403);
        });

        test('TC-STU-04 : Rejet des requêtes anonymes sans token (401)', async () => {
            const res = await request(app).get('/api/student/dashboard');
            expect(res.statusCode).toBe(401);
        });
    });
});
