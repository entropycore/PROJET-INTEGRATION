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

jest.mock('../../../src/controllers/administratorController', () => ({
  listNotifications: jest.fn((req, res) =>
    res.status(200).json({ success: true, data: { items: [] } })
  ),
  getUnreadNotificationsCount: jest.fn((req, res) =>
    res.status(200).json({ success: true, data: { count: 0 } })
  ),
  markAllNotificationsAsRead: jest.fn((req, res) =>
    res.status(200).json({ success: true, data: { updatedCount: 0 } })
  ),
  markNotificationAsRead: jest.fn((req, res) =>
    res.status(200).json({ success: true, data: { id: req.params.notificationId } })
  ),
  deleteNotification: jest.fn((req, res) =>
    res.status(200).json({ success: true, data: { id: req.params.notificationId } })
  ),
}));

const administratorController = require('../../../src/controllers/administratorController');
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

describe('Professional notifications admin alias', () => {
  it('allows an admin to read notifications from the professional alias', async () => {
    const res = await request(app)
      .get('/api/professional/notifications')
      .set('Cookie', `accessToken=${makeToken('ADMINISTRATOR', 'admin-role-id')}`);

    expect(res.status).toBe(200);
    expect(administratorController.listNotifications).toHaveBeenCalled();
  });

  it('blocks a professional from accessing the admin notifications alias', async () => {
    const res = await request(app)
      .get('/api/professional/notifications')
      .set('Cookie', `accessToken=${makeToken('PROFESSIONAL', 'professional-role-id')}`);

    expect(res.status).toBe(403);
    expect(administratorController.listNotifications).not.toHaveBeenCalled();
  });
});
