'use strict';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const express = require('express');
const cookieParser = require('cookie-parser');

process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'test-access-secret';

jest.mock('../../../../src/logs/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

jest.mock('../../../../src/services/student/notificationService');
const studentNotificationService = require('../../../../src/services/student/notificationService');

const notificationRouter = require('../../../../src/routes/student/notificationRoutes');
const authMiddleware = require('../../../../src/middlewares/authMiddleware');
const checkRoles = require('../../../../src/middlewares/checkRoles');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/student', authMiddleware, checkRoles('STUDENT'), notificationRouter);

const makeToken = (role = 'STUDENT', roleId = 40) =>
  jwt.sign(
    { userId: 1, role, roleId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );

const studentToken = makeToken();

beforeEach(() => jest.clearAllMocks());

describe("Tests d'Intégration - Routes Notifications Étudiant (notificationRoutes)", () => {

  describe('Sécurité & Rôles', () => {

    it('TC-STU-NOTIF-SEC-01 : Sans token -> 401', async () => {
      const res = await request(app).get('/api/student/notifications');
      expect(res.status).toBe(401);
    });

    it('TC-STU-NOTIF-SEC-02 : Professeur accède -> 403', async () => {
      const res = await request(app)
        .get('/api/student/notifications')
        .set('Cookie', `accessToken=${makeToken('PROFESSOR')}`);
      expect(res.status).toBe(403);
    });

  });

  describe('Endpoints Logic', () => {

    it('TC-STU-NOTIF-01 : listNotifications -> 200', async () => {
      studentNotificationService.listStudentNotifications.mockResolvedValue([{ id: 'notif-1', title: 'Alerte' }]);

      const res = await request(app)
        .get('/api/student/notifications?read=false')
        .set('Cookie', `accessToken=${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(studentNotificationService.listStudentNotifications).toHaveBeenCalledWith(1, { read: 'false' });
    });

    it('TC-STU-NOTIF-02 : getUnreadNotificationsCount -> 200', async () => {
      studentNotificationService.getStudentUnreadNotificationCount.mockResolvedValue({ count: 3 });

      const res = await request(app)
        .get('/api/student/notifications/unread-count')
        .set('Cookie', `accessToken=${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.count).toBe(3);
      expect(studentNotificationService.getStudentUnreadNotificationCount).toHaveBeenCalledWith(1);
    });

    it('TC-STU-NOTIF-03 : markAllNotificationsAsRead -> 200', async () => {
      studentNotificationService.markAllStudentNotificationsAsRead.mockResolvedValue({ success: true });

      const res = await request(app)
        .patch('/api/student/notifications/read-all')
        .set('Cookie', `accessToken=${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(studentNotificationService.markAllStudentNotificationsAsRead).toHaveBeenCalledWith(1);
    });

    it('TC-STU-NOTIF-04 : markNotificationAsRead -> 200', async () => {
      studentNotificationService.markStudentNotificationAsRead.mockResolvedValue({ id: 'notif-1', isRead: true });

      const res = await request(app)
        .patch('/api/student/notifications/notif-1/read')
        .set('Cookie', `accessToken=${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isRead).toBe(true);
      expect(studentNotificationService.markStudentNotificationAsRead).toHaveBeenCalledWith(1, 'notif-1');
    });

    it('TC-STU-NOTIF-05 : deleteNotification -> 200', async () => {
      studentNotificationService.deleteStudentNotification.mockResolvedValue({ success: true });

      const res = await request(app)
        .delete('/api/student/notifications/notif-1')
        .set('Cookie', `accessToken=${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(studentNotificationService.deleteStudentNotification).toHaveBeenCalledWith(1, 'notif-1');
    });

  });

});
