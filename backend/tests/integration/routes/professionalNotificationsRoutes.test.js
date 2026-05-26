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

jest.mock('../../../src/controllers/userNotificationController', () => ({
  listNotifications: jest.fn((req, res) =>
    res.status(200).json({ success: true, data: { items: [] } })
  ),
  getUnreadCount: jest.fn((req, res) =>
    res.status(200).json({ success: true, data: { count: 0 } })
  ),
  markAllAsRead: jest.fn((req, res) =>
    res.status(200).json({ success: true, data: { updatedCount: 0 } })
  ),
  markAsRead: jest.fn((req, res) =>
    res.status(200).json({ success: true, data: { id: req.params.notificationId } })
  ),
  deleteNotification: jest.fn((req, res) =>
    res.status(200).json({ success: true, data: { id: req.params.notificationId } })
  ),
}));

const notificationController = require('../../../src/controllers/userNotificationController');
const professionalRouter = require('../../../src/routes/professionalRoutes');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/professional', professionalRouter);

const makeToken = (role = 'PROFESSIONAL', roleId = 'role-id') =>
  jwt.sign(
    { userId: 'user-id', role, roleId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Professional notifications routes', () => {
  it('allows a professional to read professional notifications', async () => {
    const res = await request(app)
      .get('/api/professional/notifications')
      .set('Cookie', `accessToken=${makeToken('PROFESSIONAL', 'professional-role-id')}`);

    expect(res.status).toBe(200);
    expect(notificationController.listNotifications).toHaveBeenCalled();
  });

  it('blocks an admin from accessing professional notifications', async () => {
    const res = await request(app)
      .get('/api/professional/notifications')
      .set('Cookie', `accessToken=${makeToken('ADMINISTRATOR', 'admin-role-id')}`);

    expect(res.status).toBe(403);
    expect(notificationController.listNotifications).not.toHaveBeenCalled();
  });
});
