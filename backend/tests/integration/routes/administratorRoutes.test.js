'use strict';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const express = require('express');
const cookieParser = require('cookie-parser');

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
app.use('/api/administrator', administratorRouter);

const makeToken = (role = 'ADMINISTRATOR', roleId = 10) =>
  jwt.sign(
    { userId: 1, role, roleId },
    process.env.ACCESS_TOKEN_SECRET ?? 'test-secret',
    { expiresIn: '1h' }
  );

const adminToken = makeToken();

beforeEach(() => jest.clearAllMocks());

describe('Administrator Routes', () => {

  // ── Accès non autorisé ────────────────────────────────────────────────────

  it('bloque sans token → 401', async () => {
    const res = await request(app).get('/api/administrator/dashboard');
    expect(res.status).toBe(401);
  });

  it('bloque un rôle STUDENT → 403', async () => {
    const res = await request(app)
      .get('/api/administrator/dashboard')
      .set('Cookie', `accessToken=${makeToken('STUDENT')}`);
    expect(res.status).toBe(403);
  });

  // ── Dashboard & Profile ───────────────────────────────────────────────────

  it('GET /dashboard → 200 avec area et user', async () => {
    const res = await request(app)
      .get('/api/administrator/dashboard')
      .set('Cookie', `accessToken=${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.area).toBe('administrator');
    expect(res.body.data.user).toBeDefined();
  });

  // ── Liste des demandes professionnelles ───────────────────────────────────

  it('GET /professional-requests → 200 avec filtre PENDING par défaut', async () => {
    administratorService.listProfessionalRequests.mockResolvedValue([]);
    const res = await request(app)
      .get('/api/administrator/professional-requests')
      .set('Cookie', `accessToken=${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.filters.status).toBe('PENDING');
  });

  it('GET /professional-requests?status=INVALID → 400', async () => {
    const res = await request(app)
      .get('/api/administrator/professional-requests?status=INVALID')
      .set('Cookie', `accessToken=${adminToken}`);
    expect(res.status).toBe(400);
  });

  it('GET /professional-requests?emailVerified=maybe → 400', async () => {
    const res = await request(app)
      .get('/api/administrator/professional-requests?emailVerified=maybe')
      .set('Cookie', `accessToken=${adminToken}`);
    expect(res.status).toBe(400);
  });

  // ── Détail d'une demande ──────────────────────────────────────────────────

  it('GET /professional-requests/:userId → 404 si introuvable', async () => {
    administratorService.getProfessionalRequest.mockRejectedValue(new Error('REQUEST_NOT_FOUND'));
    const res = await request(app)
      .get('/api/administrator/professional-requests/99')
      .set('Cookie', `accessToken=${adminToken}`);
    expect(res.status).toBe(404);
  });

  // ── Approbation ───────────────────────────────────────────────────────────

  it('PATCH /approve → 200 si succès', async () => {
    administratorService.approveProfessionalRequest.mockResolvedValue({ status: 'APPROVED' });
    const res = await request(app)
      .patch('/api/administrator/professional-requests/42/approve')
      .set('Cookie', `accessToken=${adminToken}`);
    expect(res.status).toBe(200);
  });

  it('PATCH /approve → 409 si email non vérifié', async () => {
    administratorService.approveProfessionalRequest.mockRejectedValue(new Error('EMAIL_NOT_VERIFIED'));
    const res = await request(app)
      .patch('/api/administrator/professional-requests/42/approve')
      .set('Cookie', `accessToken=${adminToken}`);
    expect(res.status).toBe(409);
  });

  it('PATCH /approve → 409 si déjà approuvée', async () => {
    administratorService.approveProfessionalRequest.mockRejectedValue(new Error('REQUEST_ALREADY_APPROVED'));
    const res = await request(app)
      .patch('/api/administrator/professional-requests/42/approve')
      .set('Cookie', `accessToken=${adminToken}`);
    expect(res.status).toBe(409);
  });

  // ── Rejet ─────────────────────────────────────────────────────────────────

  it('PATCH /reject → 200 avec raison', async () => {
    administratorService.rejectProfessionalRequest.mockResolvedValue({ status: 'REJECTED' });
    const res = await request(app)
      .patch('/api/administrator/professional-requests/42/reject')
      .set('Cookie', `accessToken=${adminToken}`)
      .send({ rejectionReason: 'Dossier incomplet' });
    expect(res.status).toBe(200);
    expect(administratorService.rejectProfessionalRequest).toHaveBeenCalledWith('42', 10, 'Dossier incomplet');
  });

  it('PATCH /reject → passe null si raison vide', async () => {
    administratorService.rejectProfessionalRequest.mockResolvedValue({ status: 'REJECTED' });
    const res = await request(app)
      .patch('/api/administrator/professional-requests/42/reject')
      .set('Cookie', `accessToken=${adminToken}`)
      .send({ rejectionReason: '   ' });
    expect(res.status).toBe(200);
    expect(administratorService.rejectProfessionalRequest).toHaveBeenCalledWith('42', 10, null);
  });

  it('PATCH /reject → 404 si introuvable', async () => {
    administratorService.rejectProfessionalRequest.mockRejectedValue(new Error('REQUEST_NOT_FOUND'));
    const res = await request(app)
      .patch('/api/administrator/professional-requests/99/reject')
      .set('Cookie', `accessToken=${adminToken}`)
      .send({});
    expect(res.status).toBe(404);
  });
});