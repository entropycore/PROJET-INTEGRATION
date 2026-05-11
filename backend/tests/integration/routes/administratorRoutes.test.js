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

jest.mock('../../../src/services/administratorService');
const administratorService = require('../../../src/services/administratorService');

const administratorRouter = require('../../../src/routes/administratorRoutes');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/admin', administratorRouter);

const makeToken = (role = 'ADMINISTRATOR', roleId = 'admin-role-id') =>
  jwt.sign(
    { userId: 'admin-user-id', role, roleId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );

const adminToken = makeToken();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Administrator Routes', () => {
  it('blocks dashboard access without token', async () => {
    const res = await request(app).get('/api/admin/dashboard');

    expect(res.status).toBe(401);
  });

  it('blocks dashboard access for a non-admin role', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Cookie', `accessToken=${makeToken('STUDENT')}`);

    expect(res.status).toBe(403);
  });

  it('GET /api/admin/dashboard returns the dashboard payload', async () => {
    administratorService.getDashboardData.mockResolvedValue({
      summaryCards: { totalUsers: { value: 5 } },
      urgentActions: { pendingAccessRequests: 1 },
      recentRequests: [],
    });

    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Cookie', `accessToken=${adminToken}`);

    expect(res.status).toBe(200);
    expect(administratorService.getDashboardData).toHaveBeenCalled();
    expect(res.body.data.summaryCards.totalUsers.value).toBe(5);
  });

  it('GET /api/admin/notifications/unread-count returns the unread counter', async () => {
    administratorService.getUnreadNotificationsCount.mockResolvedValue(3);

    const res = await request(app)
      .get('/api/admin/notifications/unread-count')
      .set('Cookie', `accessToken=${adminToken}`);

    expect(res.status).toBe(200);
    expect(administratorService.getUnreadNotificationsCount).toHaveBeenCalledWith('admin-role-id');
    expect(res.body.data.count).toBe(3);
  });

  it('GET /api/admin/notifications returns the notifications list', async () => {
    administratorService.listNotifications.mockResolvedValue({
      items: [{ id: 'notif-1', title: 'Nouvelle demande professionnelle' }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      filters: { type: null, isRead: null, search: null },
      summary: { total: 1, unread: 1, read: 0 },
    });

    const res = await request(app)
      .get('/api/admin/notifications')
      .set('Cookie', `accessToken=${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
  });

  it('GET /api/admin/validations/pending-count returns legacy validation counters', async () => {
    administratorService.getPendingValidationCountsLegacy.mockResolvedValue({
      count: 4,
      projects: 1,
      internships: 1,
      certificates: 1,
      activities: 1,
    });

    const res = await request(app)
      .get('/api/admin/validations/pending-count')
      .set('Cookie', `accessToken=${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.projects).toBe(1);
    expect(res.body.data.internships).toBe(1);
  });

  it('GET /api/admin/validations/pending returns the pending validation list', async () => {
    administratorService.listPendingValidationsLegacy.mockResolvedValue({
      items: [{ id: 'validation-1', targetType: 'PROJECT' }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      filters: { type: null, status: 'PENDING', search: null },
      summary: { count: 1, projects: 1, internships: 0, certificates: 0, activities: 0 },
    });

    const res = await request(app)
      .get('/api/admin/validations/pending')
      .set('Cookie', `accessToken=${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
  });

  it('GET /api/admin/reports/pending-count returns legacy report counters', async () => {
    administratorService.getPendingReportsCountLegacy.mockResolvedValue({
      count: 2,
      projectReports: 1,
      commentReports: 1,
    });

    const res = await request(app)
      .get('/api/admin/reports/pending-count')
      .set('Cookie', `accessToken=${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.count).toBe(2);
  });

  it('GET /api/admin/reports returns the reports list', async () => {
    administratorService.listReports.mockResolvedValue({
      items: [{ id: 'report-1', targetType: 'PROJECT', status: 'PENDING' }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      filters: { status: 'PENDING', targetType: null, search: null },
      summary: { total: 1, pending: 1, approved: 0, rejected: 0 },
    });

    const res = await request(app)
      .get('/api/admin/reports')
      .set('Cookie', `accessToken=${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
  });

  it('GET /api/admin/profile returns the administrator profile', async () => {
    administratorService.getAdministratorProfile.mockResolvedValue({
      id: 'admin-role-id',
      employeeId: 'ADM-CRED-2026',
      department: 'Direction IT - ENSA Tanger',
    });

    const res = await request(app)
      .get('/api/admin/profile')
      .set('Cookie', `accessToken=${adminToken}`);

    expect(res.status).toBe(200);
    expect(administratorService.getAdministratorProfile).toHaveBeenCalledWith('admin-user-id');
    expect(res.body.data.employeeId).toBe('ADM-CRED-2026');
  });

  it('GET /api/admin/badges returns the badge collection', async () => {
    administratorService.listBadges.mockResolvedValue({
      items: [{ id: 'badge-1', name: 'Web Developer' }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    const res = await request(app)
      .get('/api/admin/badges')
      .set('Cookie', `accessToken=${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
  });

  it('GET /api/admin/professional-requests applies the default pending filter', async () => {
    administratorService.listProfessionalRequests.mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
    });

    const res = await request(app)
      .get('/api/admin/professional-requests')
      .set('Cookie', `accessToken=${adminToken}`);

    expect(res.status).toBe(200);
    expect(administratorService.listProfessionalRequests).toHaveBeenCalledWith({
      status: 'PENDING',
      emailVerified: undefined,
      search: undefined,
      page: 1,
      limit: 10,
    });
    expect(res.body.data.filters.status).toBe('PENDING');
  });

  it('GET /api/admin/professional-requests rejects an invalid status filter', async () => {
    const res = await request(app)
      .get('/api/admin/professional-requests?status=INVALID')
      .set('Cookie', `accessToken=${adminToken}`);

    expect(res.status).toBe(400);
  });

  it('GET /api/admin/professional-requests rejects an invalid emailVerified filter', async () => {
    const res = await request(app)
      .get('/api/admin/professional-requests?emailVerified=maybe')
      .set('Cookie', `accessToken=${adminToken}`);

    expect(res.status).toBe(400);
  });

  it('PATCH /api/admin/professional-requests/:id/reject trims the rejection reason', async () => {
    administratorService.rejectProfessionalRequest.mockResolvedValue({ status: 'REJECTED' });

    const res = await request(app)
      .patch('/api/admin/professional-requests/user-42/reject')
      .set('Cookie', `accessToken=${adminToken}`)
      .send({ rejectionReason: '  Dossier incomplet  ' });

    expect(res.status).toBe(200);
    expect(administratorService.rejectProfessionalRequest).toHaveBeenCalledWith(
      'user-42',
      'admin-role-id',
      'Dossier incomplet'
    );
  });
});
