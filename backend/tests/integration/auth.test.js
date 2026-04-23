'use strict';

const request = require('supertest');
const app = require('../../src/server');
const { PrismaClient } = require('@prisma/client');
const { saveCookies, hasCookie, isCookieCleared } = require('./helpers');

const prisma = new PrismaClient();
let cookieHeader = '';

// ─── SETUP & TEARDOWN ───────────────────────────────────────
beforeAll(async () => {
  // Nettoyage : On supprime l'utilisateur de test pour garantir un état propre
  await prisma.user.deleteMany({
    where: { email: 'sara@ensa.ac.ma' }
  });
});

afterAll(async () => {
  // Fermeture propre de la connexion Prisma
  await prisma.$disconnect();
});

// ══════════════════════════════════════════════════════
// POST /api/auth/register
// ══════════════════════════════════════════════════════
describe('AUTH - POST /register', () => {

  test('TC-AUTH-01 : Inscription reussie -> 201', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ lastName: 'Ali', firstName: 'Sara', email: 'sara@ensa.ac.ma',
              password: 'Test@1234', company: 'ENSA', jobTitle: 'Ingenieure' });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('message');
    expect(res.body.data?.passwordHash).toBeUndefined();
  });

  test('TC-AUTH-02 : Email deja utilise -> 409', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ lastName: 'Ali', firstName: 'Sara', email: 'sara@ensa.ac.ma',
              password: 'Test@1234', company: 'ENSA', jobTitle: 'Ingenieure' });
    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('TC-AUTH-03 : firstName manquant -> 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ lastName: 'Ali', email: 'sara2@ensa.ac.ma',
              password: 'Test@1234', company: 'ENSA', jobTitle: 'Ingenieure' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors.some(e => e.field === 'firstName')).toBe(true);
  });

  test('TC-AUTH-04 : Email mal formate -> 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ lastName: 'Ali', firstName: '', emaSarail: 'sara-invalide',
              password: 'Test@1234', company: 'ENSA', jobTitle: 'Ingenieure' });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors.some(e => e.field === 'email')).toBe(true);
  });

  test('TC-AUTH-05 : Password trop court -> 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ lastName: 'Ali', firstName: 'Sara', email: 'sara3@ensa.ac.ma',
              password: 'Ab@1', company: 'ENSA', jobTitle: 'Ingenieure' });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors.some(e => e.field === 'password')).toBe(true);
  });

  test('TC-AUTH-NEW-03 : Password sans majuscule -> 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ lastName: 'Ali', firstName: 'Sara', email: 'sara4@ensa.ac.ma',
              password: 'test@1234', company: 'ENSA', jobTitle: 'Ingenieure' });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors.some(e => e.field === 'password')).toBe(true);
  });

  test('TC-AUTH-NEW-04 : Password sans caractere special -> 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ lastName: 'Ali', firstName: 'Sara', email: 'sara5@ensa.ac.ma',
              password: 'TestTest1234', company: 'ENSA', jobTitle: 'Ingenieure' });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors.some(e => e.field === 'password')).toBe(true);
  });

  test('TC-AUTH-NEW-05 : lastName avec chiffres -> 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ lastName: 'Ali123', firstName: 'Sara', email: 'sara6@ensa.ac.ma',
              password: 'Test@1234', company: 'ENSA', jobTitle: 'Ingenieure' });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors.some(e => e.field === 'lastName')).toBe(true);
  });

  test('TC-AUTH-NEW-08 : Body vide -> 400', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });
});

// ══════════════════════════════════════════════════════
// POST /api/auth/login
// ══════════════════════════════════════════════════════
describe('AUTH - POST /login', () => {

  test('TC-AUTH-06 : Connexion reussie -> 200 + cookie accessToken', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'sara@ensa.ac.ma', password: 'Test@1234' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('role');
    expect(res.body).not.toHaveProperty('token'); // token dans cookie pas dans body
    expect(hasCookie(res, 'accessToken')).toBe(true);
    cookieHeader = saveCookies(res); // sauvegarde pour /me et /logout
  });

  test('TC-AUTH-07 : Mauvais mot de passe -> 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'sara@ensa.ac.ma', password: 'Mauvais@999' });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(hasCookie(res, 'accessToken')).toBe(false);
  });

  test('TC-AUTH-08 : Email inexistant -> 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'fantome@ensa.ac.ma', password: 'Test@1234' });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('TC-AUTH-09 : Body vide -> 400', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  test('TC-AUTH-NEW-01 : Email vide -> 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: '', password: 'Test@1234' });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors.some(e => e.field === 'email')).toBe(true);
  });

  test('TC-AUTH-NEW-02 : Password vide -> 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'sara@ensa.ac.ma', password: '' });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors.some(e => e.field === 'password')).toBe(true);
  });

  test('TC-AUTH-NEW-09 : Email mal formate -> 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'pasunEmail', password: 'Test@1234' });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors.some(e => e.field === 'email')).toBe(true);
  });

  test('TC-AUTH-NEW-10 : Password moins de 8 chars -> 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'sara@ensa.ac.ma', password: 'Ab@1' });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors.some(e => e.field === 'password')).toBe(true);
  });

  test('TC-AUTH-NEW-06 : Email non verifie PROFESSIONAL -> 403', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonverifie@ensa.ac.ma', password: 'Test@1234' });
    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(hasCookie(res, 'accessToken')).toBe(false);
  });

  test('TC-AUTH-NEW-07 : Compte PENDING -> 403', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'pending@ensa.ac.ma', password: 'Test@1234' });
    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

// ══════════════════════════════════════════════════════
// GET /api/auth/me
// ══════════════════════════════════════════════════════
describe('AUTH - GET /me', () => {

  test('TC-AUTH-ME-01 : Cookie valide -> 200 + donnees user sans passwordHash', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookieHeader);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('email');
    expect(res.body.data).toHaveProperty('firstName');
    expect(res.body.data).toHaveProperty('lastName');
    expect(res.body.data).toHaveProperty('role');
    expect(res.body.data.passwordHash).toBeUndefined(); // securite
  });

  test('TC-AUTH-ME-02 : Sans cookie -> 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('TC-AUTH-ME-03 : Cookie falsifie -> 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', 'accessToken=tokenbidon.faux.signature');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('TC-AUTH-ME-04 : Cookie vide -> 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', 'accessToken=');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ══════════════════════════════════════════════════════
// POST /api/auth/logout
// ══════════════════════════════════════════════════════
describe('AUTH - POST /logout', () => {

  test('TC-AUTH-10 : Deconnexion reussie -> 200 + cookies effaces', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookieHeader);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(isCookieCleared(res, 'accessToken')).toBe(true);
  });

  test('TC-AUTH-11 : Logout sans cookie -> 401', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('TC-AUTH-NEW-11 : Logout avec cookie falsifie -> 401', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', 'accessToken=tokenbidon.faux.signature');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
// ══════════════════════════════════════════════════════
// POST /api/auth/refresh-token
// ══════════════════════════════════════════════════════
describe('AUTH - POST /refresh-token', () => {

  test('TC-AUTH-RT-01 : Refresh token valide -> 200 + nouveau accessToken', async () => {
    const res = await request(app)
      .post('/api/auth/refresh-token')
      .set('Cookie', cookieHeader);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(hasCookie(res, 'accessToken')).toBe(true);
  });

  test('TC-AUTH-RT-02 : Sans cookie -> 401', async () => {
    const res = await request(app)
      .post('/api/auth/refresh-token');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('TC-AUTH-RT-03 : Refresh token falsifie -> 401', async () => {
    const res = await request(app)
      .post('/api/auth/refresh-token')
      .set('Cookie', 'refreshToken=tokenbidon.faux.signature');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
// ══════════════════════════════════════════════════════
// GET /api/auth/verify-email
// ══════════════════════════════════════════════════════
describe('AUTH - GET /verify-email', () => {

  test('TC-AUTH-VE-01 : Sans token -> 400', async () => {
    const res = await request(app)
      .get('/api/auth/verify-email');
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('TC-AUTH-VE-02 : Token invalide -> 400', async () => {
    const res = await request(app)
      .get('/api/auth/verify-email?token=tokeninvalide');
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('TC-AUTH-VE-03 : Token expiré -> 400', async () => {
    const res = await request(app)
      .get('/api/auth/verify-email?token=tokenexpire00000000000');
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});