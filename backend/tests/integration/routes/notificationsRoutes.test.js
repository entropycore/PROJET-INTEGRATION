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

jest.mock('../../../src/services/student/notificationService');
const studentNotificationService = require('../../../src/services/student/notificationService');

const notificationsRouter = require('../../../src/routes/notificationsRoutes');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/notifications', notificationsRouter);

const makeToken = (role = 'STUDENT', roleId = 40) =>
  jwt.sign(
    { userId: 1, role, roleId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );

const studentToken = makeToken();

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Tests d'Intégration - Routes Notifications Étudiant Globale (notificationsRoutes)", () => {

  describe('Sécurité & Rôles', () => {

    it('TC-NOTIF-GLOB-SEC-01 : Sans token -> 401', async () => {
      const res = await request(app).get('/api/notifications/me/unread');
      expect(res.status).toBe(401);
    });

    it('TC-NOTIF-GLOB-SEC-02 : Rôle PROFESSOR accède -> 403', async () => {
      const res = await request(app)
        .get('/api/notifications/me/unread')
        .set('Cookie', `accessToken=${makeToken('PROFESSOR')}`);
      expect(res.status).toBe(403);
    });

  });

  describe('Endpoints Logic', () => {

    it('TC-NOTIF-GLOB-01 : getUnreadNotifications -> 200', async () => {
      const mockNotifications = [{ id: 'notif-1', title: 'Nouveau message', read: false }];
      studentNotificationService.getUnreadStudentNotifications.mockResolvedValue(mockNotifications);

      const res = await request(app)
        .get('/api/notifications/me/unread')
        .set('Cookie', `accessToken=${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockNotifications);
      expect(studentNotificationService.getUnreadStudentNotifications).toHaveBeenCalledWith(1);
    });

  });

});
