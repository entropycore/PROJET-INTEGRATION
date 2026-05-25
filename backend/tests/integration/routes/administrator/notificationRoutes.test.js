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

jest.mock('../../../../src/services/administratorService');
const administratorService = require('../../../../src/services/administratorService');

const notificationRouter = require('../../../../src/routes/administrator/notificationRoutes');
const authMiddleware = require('../../../../src/middlewares/authMiddleware');
const checkRoles = require('../../../../src/middlewares/checkRoles');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/admin', authMiddleware, checkRoles('ADMINISTRATOR'), notificationRouter);

const makeToken = (role = 'ADMINISTRATOR', roleId = 'admin-role-id') =>
  jwt.sign(
    { userId: 'admin-user-id', role, roleId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );

const adminToken = makeToken();

beforeEach(() => jest.clearAllMocks());

describe("Tests d'Intégration - Routes de Gestion des Notifications (notificationRoutes)", () => {

  describe('Sécurité & Autorisation', () => {

    it('TC-NOTIF-SEC-01 : Sans token -> 401', async () => {
      const res = await request(app).get('/api/admin/notifications');
      expect(res.status).toBe(401);
    });

    it('TC-NOTIF-SEC-02 : Rôle non ADMINISTRATOR -> 403', async () => {
      const res = await request(app)
        .get('/api/admin/notifications')
        .set('Cookie', `accessToken=${makeToken('STUDENT')}`);
      expect(res.status).toBe(403);
    });

  });

  describe('Endpoints Logic', () => {

    it('TC-NOTIF-01 : listNotifications - sans filtres -> 200', async () => {
      administratorService.listNotifications.mockResolvedValue({
        items: [{ id: 'notif-1', title: 'Test Notif' }],
        pagination: { page: 1, limit: 10, total: 1 },
      });

      const res = await request(app)
        .get('/api/admin/notifications')
        .set('Cookie', `accessToken=${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(1);
      expect(administratorService.listNotifications).toHaveBeenCalledWith({
        administratorId: 'admin-role-id',
        type: undefined,
        isRead: undefined,
        search: undefined,
        page: 1,
        limit: 10,
      });
    });

    it('TC-NOTIF-02 : listNotifications - avec filtres valides -> 200', async () => {
      administratorService.listNotifications.mockResolvedValue({
        items: [{ id: 'notif-1', title: 'Test Notif' }],
        pagination: { page: 2, limit: 5, total: 6 },
      });

      const res = await request(app)
        .get('/api/admin/notifications?type=ACCESS_REQUEST&isRead=false&search=hello&page=2&limit=5')
        .set('Cookie', `accessToken=${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(administratorService.listNotifications).toHaveBeenCalledWith({
        administratorId: 'admin-role-id',
        type: 'ACCESS_REQUEST',
        isRead: false,
        search: 'hello',
        page: 2,
        limit: 5,
      });
    });

    it('TC-NOTIF-03 : listNotifications - type invalide -> 400', async () => {
      const res = await request(app)
        .get('/api/admin/notifications?type=INVALID_TYPE')
        .set('Cookie', `accessToken=${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/type est invalide/i);
    });

    it('TC-NOTIF-04 : listNotifications - isRead invalide -> 400', async () => {
      const res = await request(app)
        .get('/api/admin/notifications?isRead=maybe')
        .set('Cookie', `accessToken=${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/isRead doit valoir/i);
    });

    it('TC-NOTIF-05 : getUnreadNotificationsCount -> 200', async () => {
      administratorService.getUnreadNotificationsCount.mockResolvedValue(5);

      const res = await request(app)
        .get('/api/admin/notifications/unread-count')
        .set('Cookie', `accessToken=${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.count).toBe(5);
      expect(administratorService.getUnreadNotificationsCount).toHaveBeenCalledWith('admin-role-id');
    });

    it('TC-NOTIF-06 : markNotificationAsRead - succès -> 200', async () => {
      administratorService.markNotificationAsRead.mockResolvedValue({ id: 'notif-1', isRead: true });

      const res = await request(app)
        .patch('/api/admin/notifications/notif-1/read')
        .set('Cookie', `accessToken=${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isRead).toBe(true);
      expect(administratorService.markNotificationAsRead).toHaveBeenCalledWith('notif-1', 'admin-role-id');
    });

    it('TC-NOTIF-07 : markNotificationAsRead - introuvable -> 404', async () => {
      administratorService.markNotificationAsRead.mockRejectedValue(new Error('NOTIFICATION_NOT_FOUND'));

      const res = await request(app)
        .patch('/api/admin/notifications/uuid-inexistant/read')
        .set('Cookie', `accessToken=${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Notification introuvable/i);
    });

    it('TC-NOTIF-08 : deleteNotification - succès -> 200', async () => {
      administratorService.deleteNotification.mockResolvedValue({ success: true });

      const res = await request(app)
        .delete('/api/admin/notifications/notif-1')
        .set('Cookie', `accessToken=${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(administratorService.deleteNotification).toHaveBeenCalledWith('notif-1', 'admin-role-id');
    });

    it('TC-NOTIF-09 : deleteNotification - introuvable -> 404', async () => {
      administratorService.deleteNotification.mockRejectedValue(new Error('NOTIFICATION_NOT_FOUND'));

      const res = await request(app)
        .delete('/api/admin/notifications/uuid-inexistant')
        .set('Cookie', `accessToken=${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Notification introuvable/i);
    });

    it('TC-NOTIF-10 : markAllNotificationsAsRead -> 200', async () => {
      administratorService.markAllNotificationsAsRead.mockResolvedValue({ count: 10 });

      const res = await request(app)
        .patch('/api/admin/notifications/read-all')
        .set('Cookie', `accessToken=${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(administratorService.markAllNotificationsAsRead).toHaveBeenCalledWith('admin-role-id');
    });

  });

});
