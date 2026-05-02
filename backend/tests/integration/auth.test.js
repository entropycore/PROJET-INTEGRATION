'use strict';

const request = require('supertest');
const app = require('../../src/server');
const { PrismaClient } = require('../../src/generated/prisma');
const prisma = new PrismaClient();
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
// ************************
// POST /api/auth/verify-email
// ************************
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

  test('TC-AUTH-VE-03 : Token expire -> 400', async () => {
    const res = await request(app)
      .get('/api/auth/verify-email?token=tokenexpire00000000000');
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ***********************
// POST /api/auth/login
// ***********************
describe('AUTH - POST /login', () => {

test('TC-AUTH-06 : Login réussi -> 200', async () => {
    const userEmail = `test.${timestamp}@ensa.ac.ma`;
    // 1. Activation du compte dans la table User
    await prisma.user.update({
        where: { email: userEmail },
        data: { accountStatus: 'ACTIVE' } // Passage du statut de PENDING à ACTIVE
    });
    // 2. Vérification de l'email dans la table Professional (car l'inscription est de type Professional dans TC-AUTH-01)
    await prisma.professional.update({
        where: { 
            // Recherche via l'ID de l'utilisateur associé à cet email
            userId: (await prisma.user.findUnique({ where: { email: userEmail } })).id 
        },
        data: { isEmailVerified: true }
    });
    const res = await request(app)
        .post('/api/auth/login')
        .send({ 
            email: userEmail, 
            password: 'Test@1234' 
        });
    expect(res.statusCode).toBe(200);
    // Récupération des cookies pour les tests suivants (ex: refresh-token)
    cookieHeader = saveCookies(res); 
    expect(hasCookie(res, 'accessToken')).toBe(true);
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
    const res = await request(app)
      .post('/api/auth/login')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(Array.isArray(res.body.errors)).toBe(true);
  });
});

// *************************
// GET /api/auth/me
// *************************

describe('AUTH - GET /me', () => {

  test('TC-AUTH-ME-01 : Cookie valide -> 200 + donnees sans passwordHash', async () => {
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
    expect(res.body.data.passwordHash).toBeUndefined();
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
// *************************
// POST /api/auth/refresh-token
// *************************
describe('AUTH - POST /refresh-token',() => {

  test('TC-AUTH-RT-01 : Refresh token valide -> 200 + nouveau accessToken', async () => {
    const res = await request(app)
    .post('/api/auth/refresh-token')
    .set('Cookie',cookieHeader);
    console.log("la reponse de serveur :", res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(hasCookie(res, 'accessToken')).toBe(true);
  });

  test('TC-AUTH-RT-02 : Sans cookie -> 401', async () => {
    const res=await request(app)
    .post('/api/auth/refresh-token');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false)
  });

  test('TC-AUTH-RT-03 : Refresh token falsifie -> 401', async () => {
    const res = await request(app)
    .post('/api/auth/refresh-token')
    .set('Cookie', 'refresh-token')
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
});
})

// ************************
// POST /api/auth/logout
// ************************
describe('AUTH - POST /logout', () => {

  test('TC-AUTH-11 : Sans cookie -> 401', async () => {
    const res = await request(app)
      .post('/api/auth/logout');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('TC-AUTH-12 : Cookie falsifie -> 401', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', 'accessToken=tokenbidon.faux.signature');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
test('TC-AUTH-01 : Deconnexion reussie -> 200 + cookies effaces', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookieHeader);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(isCookieCleared(res, 'accessToken')).toBe(true);
  });
});