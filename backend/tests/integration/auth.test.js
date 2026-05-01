'use strict';

const request = require('supertest');
const app = require('../../src/server');

// ─── HELPERS ───────────────────────────────────────────────
const saveCookies = (res) => (res.headers['set-cookie'] || []).join('; ');

const hasCookie = (res, name) =>
  (res.headers['set-cookie'] || []).some(c => c.startsWith(name + '='));

const isCookieCleared = (res, name) =>
  (res.headers['set-cookie'] || []).some(
    c => c.startsWith(name + '=') && c.includes('Expires=Thu, 01 Jan 1970')
  );

let cookieHeader = '';
const timestamp = Date.now();

// *************************
// POST /api/auth/register
// *************************
describe('AUTH - POST /register', () => {

  test('TC-AUTH-01 : Inscription reussie -> 201', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        lastName: 'Ali',
        firstName: 'Sara',
        email: `test.${timestamp}@ensa.ac.ma`,
        password: 'Test@1234',
        company: 'ENSA',
        jobTitle: 'Ingenieure'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('message');
    expect(res.body.data?.passwordHash).toBeUndefined();
  });

  test('TC-AUTH-02 : Email deja utilise -> 409', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        lastName: 'Ali',
        firstName: 'Sara',
        email: `test.${timestamp}@ensa.ac.ma`,
        password: 'Test@1234',
        company: 'ENSA',
        jobTitle: 'Ingenieure'
      });
    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('TC-AUTH-05 : Password trop court -> 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        lastName: 'Ali',
        firstName: 'Sara',
        email: `sara3.${timestamp}@ensa.ac.ma`,
        password: 'Ab@1',
        company: 'ENSA',
        jobTitle: 'Ingenieure'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors.some(e => e.field === 'password')).toBe(true);
  });
});

// ***********************
// POST /api/auth/login
// ***********************
describe('AUTH - POST /login', () => {
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
    const res = await request(app)
      .post('/api/auth/login')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(Array.isArray(res.body.errors)).toBe(true);
  });
});

// ************************
// POST /api/auth/logout
// ************************
describe('AUTH - POST /logout', () => {

  test('TC-AUTH-10 : Deconnexion reussie -> 200 + cookies effaces', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookieHeader);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(isCookieCleared(res, 'accessToken')).toBe(true);
  });

});