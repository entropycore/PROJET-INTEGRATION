'use strict';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const express = require('express');
const cookieParser = require('cookie-parser');

require('dotenv').config();

// Mock the services
const mockProfessionalService = {
  getProfessionalDashboard: jest.fn(),
  getProfessionalProfile: jest.fn()
};

jest.mock('../../../src/services/professionalService', () => mockProfessionalService);

const mockUserNotificationService = {
  listUserNotifications: jest.fn(),
  getUnreadCount: jest.fn(),
  getUnreadNotifications: jest.fn(),
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
  deleteNotification: jest.fn()
};

jest.mock('../../../src/services/userNotificationService', () => mockUserNotificationService);

jest.mock('../../../src/logs/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

const professionalRouter = require('../../../src/routes/professionalRoutes');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/professional', professionalRouter);

const SECRET = process.env.ACCESS_TOKEN_SECRET || 'testsecret';

const makeToken = (role = 'PROFESSIONAL', roleId = 20, expiresIn = '1h') =>
  jwt.sign(
    { userId: 1, role, roleId },
    SECRET,
    { expiresIn }
  );

const professionalToken = makeToken();

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Tests d'Intégration Complets - Routes Professionnel", () => {

  describe('Sécurité & Rôles', () => {
    it('TC-PRO-SEC-01 : Sans token → 401', async () => {
      const res = await request(app).get('/api/professional/dashboard');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('TC-PRO-SEC-02 : Token expiré → 401', async () => {
      const expiredToken = makeToken('PROFESSIONAL', 20, '-1s');
      const res = await request(app)
        .get('/api/professional/dashboard')
        .set('Cookie', `accessToken=${expiredToken}`);
      expect(res.status).toBe(401);
    });

    it('TC-PRO-SEC-03 : Étudiant tente accès Professionnel → 403', async () => {
      const res = await request(app)
        .get('/api/professional/dashboard')
        .set('Cookie', `accessToken=${makeToken('STUDENT')}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Dashboard Endpoints', () => {
    it('TC-PRO-DSH-01 : getDashboard Succès → 200', async () => {
      const mockDashboard = { area: 'professional', stats: { totalApplications: 5 } };
      mockProfessionalService.getProfessionalDashboard.mockResolvedValue(mockDashboard);

      const res = await request(app)
        .get('/api/professional/dashboard')
        .set('Cookie', `accessToken=${professionalToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockDashboard);
    });

    it('TC-PRO-DSH-02 : getDashboard Profil Non Trouvé → 404', async () => {
      mockProfessionalService.getProfessionalDashboard.mockRejectedValue(new Error('PROFESSIONAL_PROFILE_NOT_FOUND'));

      const res = await request(app)
        .get('/api/professional/dashboard')
        .set('Cookie', `accessToken=${professionalToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('introuvable');
    });

    it('TC-PRO-DSH-03 : getDashboard Autre Erreur → 500 dans Express flow (simulé)', async () => {
      mockProfessionalService.getProfessionalDashboard.mockRejectedValue(new Error('DATABASE_ERROR'));

      // Use a custom error handler for this test block
      const tempApp = express();
      tempApp.use(cookieParser());
      tempApp.use('/api/professional', professionalRouter);
      tempApp.use((err, req, res, next) => {
        res.status(500).json({ success: false, error: err.message });
      });

      const res = await request(tempApp)
        .get('/api/professional/dashboard')
        .set('Cookie', `accessToken=${professionalToken}`);

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('DATABASE_ERROR');
    });
  });

  describe('Profile Endpoints', () => {
    it('TC-PRO-PRF-01 : getProfile Succès → 200', async () => {
      const mockProfile = { user: { id: 1 }, profile: { company: 'TestCorp' } };
      mockProfessionalService.getProfessionalProfile.mockResolvedValue(mockProfile);

      const res = await request(app)
        .get('/api/professional/profile')
        .set('Cookie', `accessToken=${professionalToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockProfile);
    });

    it('TC-PRO-PRF-02 : getProfile Profil Non Trouvé → 404', async () => {
      mockProfessionalService.getProfessionalProfile.mockRejectedValue(new Error('PROFESSIONAL_PROFILE_NOT_FOUND'));

      const res = await request(app)
        .get('/api/professional/profile')
        .set('Cookie', `accessToken=${professionalToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('introuvable');
    });
  });

  describe('Notifications Endpoints', () => {
    it('TC-PRO-NTF-01 : listNotifications → 200', async () => {
      mockUserNotificationService.listUserNotifications.mockResolvedValue({ items: [], total: 0 });
      const res = await request(app)
        .get('/api/professional/notifications')
        .set('Cookie', `accessToken=${professionalToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.items).toEqual([]);
    });

    it('TC-PRO-NTF-02 : getUnreadCount → 200', async () => {
      mockUserNotificationService.getUnreadCount.mockResolvedValue(0);
      const res = await request(app)
        .get('/api/professional/notifications/unread-count')
        .set('Cookie', `accessToken=${professionalToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.count).toBe(0);
    });

    it('TC-PRO-NTF-03 : markAllAsRead → 200', async () => {
      mockUserNotificationService.markAllAsRead.mockResolvedValue({ count: 0 });
      const res = await request(app)
        .patch('/api/professional/notifications/read-all')
        .set('Cookie', `accessToken=${professionalToken}`);

      expect(res.status).toBe(200);
    });

    it('TC-PRO-NTF-04 : markAsRead → 200', async () => {
      mockUserNotificationService.markAsRead.mockResolvedValue({ notificationId: 'notif-456' });
      const res = await request(app)
        .patch('/api/professional/notifications/notif-456/read')
        .set('Cookie', `accessToken=${professionalToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.notificationId).toBe('notif-456');
    });

    it('TC-PRO-NTF-05 : deleteNotification → 200', async () => {
      mockUserNotificationService.deleteNotification.mockResolvedValue({ notificationId: 'notif-456' });
      const res = await request(app)
        .delete('/api/professional/notifications/notif-456')
        .set('Cookie', `accessToken=${professionalToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.notificationId).toBe('notif-456');
    });
  });

});