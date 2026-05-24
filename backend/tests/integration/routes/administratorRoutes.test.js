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

beforeEach(() => jest.clearAllMocks());

// ─────────────────────────────────────────────────────────────
describe('ADMIN - Auth globale', () => {

  it('TC-ADMIN-AUTH-01 : Sans token -> 401', async () => {
    const res = await request(app).get('/api/admin/dashboard');
    expect(res.status).toBe(401);
  });

  it('TC-ADMIN-AUTH-02 : Role non ADMINISTRATOR -> 403', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Cookie', `accessToken=${makeToken('STUDENT')}`);
    expect(res.status).toBe(403);
  });
});

// ─────────────────────────────────────────────────────────────
describe('ADMIN - GET /dashboard', () => {

  it('TC-ADMIN-DB-01 : Retourne le payload dashboard -> 200', async () => {
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
});

// ─────────────────────────────────────────────────────────────
describe('ADMIN - GET /dashboard-items/:itemType/:itemId', () => {

  it('TC-ADMIN-DASH-01 : Item trouve -> 200', async () => {
    administratorService.getDashboardItemDetail.mockResolvedValue({
      id: 'user-uuid-002', type: 'ACCESS_REQUEST', status: 'PENDING'
    });
    const res = await request(app)
      .get('/api/admin/dashboard-items/ACCESS_REQUEST/user-uuid-002')
      .set('Cookie', `accessToken=${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('id');
  });

  it('TC-ADMIN-DASH-02 : Type non supporte -> 400', async () => {
    administratorService.getDashboardItemDetail.mockRejectedValue(
      new Error('UNSUPPORTED_DASHBOARD_ITEM_TYPE')
    );
    const res = await request(app)
      .get('/api/admin/dashboard-items/TYPE_INVALIDE/some-id')
      .set('Cookie', `accessToken=${adminToken}`);
    expect(res.status).toBe(400);
  });

  it('TC-ADMIN-DASH-03 : Item introuvable -> 404', async () => {
    administratorService.getDashboardItemDetail.mockRejectedValue(
      new Error('DASHBOARD_ITEM_NOT_FOUND')
    );
    const res = await request(app)
      .get('/api/admin/dashboard-items/ACCESS_REQUEST/uuid-inexistant')
      .set('Cookie', `accessToken=${adminToken}`);
    expect(res.status).toBe(404);
  });

  it('TC-ADMIN-DASH-04 : Sans token -> 401', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard-items/ACCESS_REQUEST/user-uuid-002');
    expect(res.status).toBe(401);
  });

  it('TC-ADMIN-DASH-05 : Role non ADMINISTRATOR -> 403', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard-items/ACCESS_REQUEST/user-uuid-002')
      .set('Cookie', `accessToken=${makeToken('STUDENT')}`);
    expect(res.status).toBe(403);
  });
});

// ─────────────────────────────────────────────────────────────
describe('ADMIN - GET /validations/pending-count', () => {

  it('TC-ADMIN-VPC-01 : Retourne les compteurs -> 200', async () => {
    administratorService.getPendingValidationCountsLegacy.mockResolvedValue({
      count: 4, projects: 1, internships: 1, certificates: 1, activities: 1,
    });
    const res = await request(app)
      .get('/api/admin/validations/pending-count')
      .set('Cookie', `accessToken=${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.projects).toBe(1);
    expect(res.body.data.internships).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────
describe('ADMIN - GET /validations/pending', () => {

  it('TC-ADMIN-VP-01 : Liste validations en attente -> 200', async () => {
    administratorService.listPendingValidationsLegacy.mockResolvedValue({
      items: [{ id: 'validation-1', targetType: 'PROJECT' }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      filters: { type: null, status: 'PENDING', search: null },
    });
    const res = await request(app)
      .get('/api/admin/validations/pending')
      .set('Cookie', `accessToken=${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
  });
});

// ─────────────────────────────────────────────────────────────
describe('ADMIN - GET /validations/:validationId', () => {

  it('TC-ADMIN-VAL-LEG-01 : Validation trouvee -> 200', async () => {
    administratorService.getLegacyValidationDetail.mockResolvedValue({
      id: 'project-uuid-001', itemType: 'PROJECT', status: 'PENDING'
    });
    const res = await request(app)
      .get('/api/admin/validations/project-uuid-001')
      .set('Cookie', `accessToken=${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('id');
  });

  it('TC-ADMIN-VAL-LEG-02 : ID introuvable -> 404', async () => {
    administratorService.getLegacyValidationDetail.mockRejectedValue(
      new Error('VALIDATION_ITEM_NOT_FOUND')
    );
    const res = await request(app)
      .get('/api/admin/validations/uuid-inexistant')
      .set('Cookie', `accessToken=${adminToken}`);
    expect(res.status).toBe(404);
  });

  it('TC-ADMIN-VAL-LEG-03 : Sans token -> 401', async () => {
    const res = await request(app)
      .get('/api/admin/validations/project-uuid-001');
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────
describe('ADMIN - GET /validations', () => {

  it('TC-ADMIN-VAL-01 : Liste validations -> 200', async () => {
    administratorService.listValidationItems.mockResolvedValue({
      items: [{ id: 'project-uuid-001', type: 'PROJECT', status: 'PENDING' }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
    });
    const res = await request(app)
      .get('/api/admin/validations')
      .set('Cookie', `accessToken=${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });

  it('TC-ADMIN-VAL-02 : Filtre type invalide -> 400', async () => {
    const res = await request(app)
      .get('/api/admin/validations?type=TYPE_INVALIDE')
      .set('Cookie', `accessToken=${adminToken}`);
    expect(res.status).toBe(400);
    expect(administratorService.listValidationItems).not.toHaveBeenCalled();
  });

  it('TC-ADMIN-VAL-03 : Filtre status invalide -> 400', async () => {
    const res = await request(app)
      .get('/api/admin/validations?status=STATUS_INVALIDE')
      .set('Cookie', `accessToken=${adminToken}`);
    expect(res.status).toBe(400);
    expect(administratorService.listValidationItems).not.toHaveBeenCalled();
  });

  it('TC-ADMIN-VAL-04 : Sans token -> 401', async () => {
    const res = await request(app).get('/api/admin/validations');
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────
describe('ADMIN - GET /validations/:itemType/:itemId', () => {

  it('TC-ADMIN-VAL-DET-01 : Element trouve -> 200', async () => {
    administratorService.getValidationItemDetail.mockResolvedValue({
      id: 'project-uuid-001', type: 'PROJECT', status: 'PENDING'
    });
    const res = await request(app)
      .get('/api/admin/validations/PROJECT/project-uuid-001')
      .set('Cookie', `accessToken=${adminToken}`);
    expect(res.status).toBe(200);
    expect(administratorService.getValidationItemDetail)
      .toHaveBeenCalledWith('PROJECT', 'project-uuid-001');
  });

  it('TC-ADMIN-VAL-DET-02 : Type non supporte -> 400', async () => {
    administratorService.getValidationItemDetail.mockRejectedValue(
      new Error('UNSUPPORTED_VALIDATION_TYPE')
    );
    const res = await request(app)
      .get('/api/admin/validations/TYPE_INVALIDE/some-id')
      .set('Cookie', `accessToken=${adminToken}`);
    expect(res.status).toBe(400);
  });

  it('TC-ADMIN-VAL-DET-03 : Item introuvable -> 404', async () => {
    administratorService.getValidationItemDetail.mockRejectedValue(
      new Error('VALIDATION_ITEM_NOT_FOUND')
    );
    const res = await request(app)
      .get('/api/admin/validations/PROJECT/uuid-inexistant')
      .set('Cookie', `accessToken=${adminToken}`);
    expect(res.status).toBe(404);
  });

  it('TC-ADMIN-VAL-DET-04 : Sans token -> 401', async () => {
    const res = await request(app)
      .get('/api/admin/validations/PROJECT/project-uuid-001');
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────
describe('ADMIN - GET /reports/pending-count', () => {

  it('TC-ADMIN-RPC-01 : Retourne le compteur -> 200', async () => {
    administratorService.getPendingReportsCount.mockResolvedValue(2);
    const res = await request(app)
      .get('/api/admin/reports/pending-count')
      .set('Cookie', `accessToken=${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.count).toBe(2);
  });
});

// ─────────────────────────────────────────────────────────────
describe('ADMIN - GET /reports', () => {

  it('TC-ADMIN-REP-LIST-01 : Liste signalements -> 200', async () => {
    administratorService.listReports.mockResolvedValue({
      items: [{ id: 'report-1', targetType: 'PROJECT', status: 'PENDING' }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      filters: { status: 'PENDING', targetType: null, search: null },
    });
    const res = await request(app)
      .get('/api/admin/reports')
      .set('Cookie', `accessToken=${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
  });

  it('TC-ADMIN-REP-LIST-02 : Sans token -> 401', async () => {
    const res = await request(app).get('/api/admin/reports');
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────
describe('ADMIN - GET /reports/:reportId', () => {

  it('TC-ADMIN-REP-01 : Signalement trouve -> 200', async () => {
    administratorService.getReportById.mockResolvedValue({
      id: 'report-uuid-001', targetType: 'PROJECT', status: 'PENDING'
    });
    const res = await request(app)
      .get('/api/admin/reports/report-uuid-001')
      .set('Cookie', `accessToken=${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('targetType');
    expect(administratorService.getReportById).toHaveBeenCalledWith('report-uuid-001');
  });

  it('TC-ADMIN-REP-02 : Signalement introuvable -> 404', async () => {
    administratorService.getReportById.mockRejectedValue(
      new Error('REPORT_NOT_FOUND')
    );
    const res = await request(app)
      .get('/api/admin/reports/uuid-inexistant')
      .set('Cookie', `accessToken=${adminToken}`);
    expect(res.status).toBe(404);
  });

  it('TC-ADMIN-REP-03 : Sans token -> 401', async () => {
    const res = await request(app).get('/api/admin/reports/report-uuid-001');
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────
describe('ADMIN - GET /users', () => {

  it('TC-ADMIN-USR-01 : Liste users -> 200 sans passwordHash', async () => {
    administratorService.listUsers.mockResolvedValue({
      items: [{ id: 'user-uuid-001', email: 'sara@ensa.ac.ma', role: 'STUDENT' }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
    });
    const res = await request(app)
      .get('/api/admin/users')
      .set('Cookie', `accessToken=${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.items)).toBe(true);
    res.body.data.items.forEach(u => expect(u.passwordHash).toBeUndefined());
  });

  it('TC-ADMIN-USR-02 : Filtre role invalide -> 400', async () => {
    const res = await request(app)
      .get('/api/admin/users?role=ROLE_INVALIDE')
      .set('Cookie', `accessToken=${adminToken}`);
    expect(res.status).toBe(400);
    expect(administratorService.listUsers).not.toHaveBeenCalled();
  });

  it('TC-ADMIN-USR-03 : Filtre status invalide -> 400', async () => {
    const res = await request(app)
      .get('/api/admin/users?status=STATUS_INVALIDE')
      .set('Cookie', `accessToken=${adminToken}`);
    expect(res.status).toBe(400);
    expect(administratorService.listUsers).not.toHaveBeenCalled();
  });

  it('TC-ADMIN-USR-04 : Sans token -> 401', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────
describe('ADMIN - GET /users/:userId', () => {

  it('TC-ADMIN-USR-DET-01 : User trouve -> 200 sans passwordHash', async () => {
    administratorService.getUserById.mockResolvedValue({
      id: 'user-uuid-001', email: 'sara@ensa.ac.ma', role: 'STUDENT'
    });
    const res = await request(app)
      .get('/api/admin/users/user-uuid-001')
      .set('Cookie', `accessToken=${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.passwordHash).toBeUndefined();
    expect(administratorService.getUserById).toHaveBeenCalledWith('user-uuid-001');
  });

  it('TC-ADMIN-USR-DET-02 : User introuvable -> 404', async () => {
    administratorService.getUserById.mockRejectedValue(new Error('USER_NOT_FOUND'));
    const res = await request(app)
      .get('/api/admin/users/uuid-inexistant')
      .set('Cookie', `accessToken=${adminToken}`);
    expect(res.status).toBe(404);
  });

  it('TC-ADMIN-USR-DET-03 : Sans token -> 401', async () => {
    const res = await request(app).get('/api/admin/users/user-uuid-001');
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────
describe('ADMIN - GET /profile', () => {

  it('TC-ADMIN-PROF-01 : Retourne le profil -> 200', async () => {
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
});

// ─────────────────────────────────────────────────────────────
describe('ADMIN - GET /badges', () => {

  it('TC-ADMIN-BADGE-01 : Liste badges -> 200', async () => {
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
});

// ─────────────────────────────────────────────────────────────
describe('ADMIN - GET /professional-requests', () => {

  it('TC-ADMIN-PRO-LIST-01 : Filtre PENDING par defaut -> 200', async () => {
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

  it('TC-ADMIN-PRO-LIST-02 : Filtre status invalide -> 400', async () => {
    const res = await request(app)
      .get('/api/admin/professional-requests?status=INVALID')
      .set('Cookie', `accessToken=${adminToken}`);
    expect(res.status).toBe(400);
  });

  it('TC-ADMIN-PRO-LIST-03 : Filtre emailVerified invalide -> 400', async () => {
    const res = await request(app)
      .get('/api/admin/professional-requests?emailVerified=maybe')
      .set('Cookie', `accessToken=${adminToken}`);
    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────────────────────
describe('ADMIN - GET /professional-requests/:userId', () => {

  it('TC-ADMIN-PRO-01 : Demande trouvee -> 200', async () => {
    administratorService.getProfessionalRequest.mockResolvedValue({
      id: 'user-uuid-002',
      email: 'ahmed@company.ma',
      accountStatus: 'PENDING',
      professional: { company: 'TechCorp', isEmailVerified: true }
    });
    const res = await request(app)
      .get('/api/admin/professional-requests/user-uuid-002')
      .set('Cookie', `accessToken=${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('professional');
    expect(res.body.data.passwordHash).toBeUndefined();
  });

  it('TC-ADMIN-PRO-02 : Demande introuvable -> 404', async () => {
    administratorService.getProfessionalRequest.mockRejectedValue(
      new Error('REQUEST_NOT_FOUND')
    );
    const res = await request(app)
      .get('/api/admin/professional-requests/uuid-inexistant')
      .set('Cookie', `accessToken=${adminToken}`);
    expect(res.status).toBe(404);
  });

  it('TC-ADMIN-PRO-03 : Sans token -> 401', async () => {
    const res = await request(app)
      .get('/api/admin/professional-requests/user-uuid-002');
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────
describe('ADMIN - PATCH /professional-requests/:id/reject', () => {

  it('TC-ADMIN-PRO-REJ-01 : Trim la raison de rejet -> 200', async () => {
    administratorService.rejectProfessionalRequest.mockResolvedValue({ status: 'REJECTED' });
    const res = await request(app)
      .patch('/api/admin/professional-requests/user-42/reject')
      .set('Cookie', `accessToken=${adminToken}`)
      .send({ rejectionReason: '  Dossier incomplet  ' });
    expect(res.status).toBe(200);
    expect(administratorService.rejectProfessionalRequest).toHaveBeenCalledWith(
      'user-42', 'admin-role-id', 'Dossier incomplet'
    );
  });
});