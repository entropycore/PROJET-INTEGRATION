'use strict';

/**
 * USERS INTEGRATION TESTS
 * Routes testées : GET /users, GET /users/:id, PUT /users/:id
 * Auth : Cookie httpOnly (accessToken)
 * Format réponse : { success: bool, data?: object|array, message?: string }
 *
 * ⚠️ PRÉREQUIS : Adapter les variables de la section CONFIG selon ta base de test
 */

const request = require('supertest');
const app = require('../../src/app');

// ══════════════════════════════════════════════════════════════
// CONFIG — À adapter selon ta base de données de test
// ══════════════════════════════════════════════════════════════

const USER_CREDENTIALS = {
  email: 'sara.test@ensa.ac.ma',
  password: 'Test@1234'
};

// ID d'un autre utilisateur (pour tester le 403 — accès interdit)
const OTHER_USER_ID = '00000000-0000-0000-0000-000000000099';

// ══════════════════════════════════════════════════════════════
// SETUP — Login avant tous les tests users
// ══════════════════════════════════════════════════════════════

let cookieHeader = '';
let myUserId = '';

beforeAll(async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send(USER_CREDENTIALS);

  if (res.statusCode !== 200) {
    throw new Error(
      `[beforeAll] Login échoué (${res.statusCode}) — vérifie que l'utilisateur existe en base de test`
    );
  }

  // Sauvegarde du cookie pour tous les tests
  cookieHeader = (res.headers['set-cookie'] || []).join('; ');

  // Récupération de l'ID de l'utilisateur connecté via /me
  const meRes = await request(app)
    .get('/api/auth/me')
    .set('Cookie', cookieHeader);

  myUserId = meRes.body.data?.id;

  if (!myUserId) {
    throw new Error('[beforeAll] Impossible de récupérer userId depuis /me');
  }
});

// ══════════════════════════════════════════════════════════════
// GET /api/users — LISTE DES UTILISATEURS
// ══════════════════════════════════════════════════════════════

describe('USERS - GET /users', () => {

  // ── Cas valide ───────────────────────────────────────────────

  test('TC-USER-01 : Liste utilisateurs → 200 + tableau valide', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Cookie', cookieHeader);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    // La liste doit être un tableau
    const users = res.body.data ?? res.body;
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);

    // Chaque user doit avoir les champs attendus
    users.forEach(user => {
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('firstName');
      expect(user).toHaveProperty('lastName');
      expect(user).toHaveProperty('role');
      // Sécurité : jamais de passwordHash exposé
      expect(user.passwordHash).toBeUndefined();
    });
  });

  // ── Sans authentification ────────────────────────────────────

  test('TC-USER-02 : Sans cookie → 401', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/authentification/i);
  });

  test('TC-USER-NEW-01 : Cookie falsifié → 401', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Cookie', 'accessToken=tokenbidon.faux.signature');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════
// GET /api/users/:id — UN UTILISATEUR
// ══════════════════════════════════════════════════════════════

describe('USERS - GET /users/:id', () => {

  // ── Cas valide ───────────────────────────────────────────────

  test('TC-USER-03 : Utilisateur trouvé → 200 + données complètes', async () => {
    const res = await request(app)
      .get(`/api/users/${myUserId}`)
      .set('Cookie', cookieHeader);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const user = res.body.data ?? res.body;
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('firstName');
    expect(user).toHaveProperty('lastName');
    expect(user).toHaveProperty('role');
    expect(String(user.id)).toBe(String(myUserId));

    // Sécurité
    expect(user.passwordHash).toBeUndefined();
  });

  // ── ID invalides ─────────────────────────────────────────────

  test('TC-USER-04 : ID inexistant → 404', async () => {
    const res = await request(app)
      .get('/api/users/00000000-0000-0000-0000-000000000000')
      .set('Cookie', cookieHeader);
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('TC-USER-05 : ID invalide (texte libre) → 400', async () => {
    const res = await request(app)
      .get('/api/users/abc-invalid-id')
      .set('Cookie', cookieHeader);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('TC-USER-NEW-02 : ID invalide (chiffre simple) → 400', async () => {
    const res = await request(app)
      .get('/api/users/99999')
      .set('Cookie', cookieHeader);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // ── Sans authentification ────────────────────────────────────

  test('TC-USER-NEW-03 : Sans cookie → 401', async () => {
    const res = await request(app).get(`/api/users/${myUserId}`);
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════
// PUT /api/users/:id — MODIFIER UN UTILISATEUR
// ══════════════════════════════════════════════════════════════

describe('USERS - PUT /users/:id', () => {

  // ── Cas valide ───────────────────────────────────────────────

  test('TC-USER-06 : Modification réussie → 200 + données mises à jour', async () => {
    const res = await request(app)
      .put(`/api/users/${myUserId}`)
      .set('Cookie', cookieHeader)
      .send({ firstName: 'SaraModifiée', lastName: 'AliModifié' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const updated = res.body.data ?? res.body;
    expect(updated.firstName).toBe('SaraModifiée');
    expect(updated.lastName).toBe('AliModifié');
    expect(updated.passwordHash).toBeUndefined();
  });

  // ── Accès interdit ───────────────────────────────────────────

  test('TC-USER-07 : Modifier un autre utilisateur → 403', async () => {
    const res = await request(app)
      .put(`/api/users/${OTHER_USER_ID}`)
      .set('Cookie', cookieHeader)
      .send({ firstName: 'Hack' });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // ── Sans authentification ────────────────────────────────────

  test('TC-USER-08 : Sans cookie → 401', async () => {
    const res = await request(app)
      .put(`/api/users/${myUserId}`)
      .send({ firstName: 'Test' });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // ── Email dupliqué ───────────────────────────────────────────

  test('TC-USER-09 : Email déjà pris → 409', async () => {
    // Prérequis : avoir en base un autre user avec cet email
    const res = await request(app)
      .put(`/api/users/${myUserId}`)
      .set('Cookie', cookieHeader)
      .send({ email: 'existant@ensa.ac.ma' });

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  // ── Validation champs ────────────────────────────────────────

  test('TC-USER-NEW-04 : Email invalide dans PUT → 400', async () => {
    const res = await request(app)
      .put(`/api/users/${myUserId}`)
      .set('Cookie', cookieHeader)
      .send({ email: 'pasunemail' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('TC-USER-NEW-05 : firstName avec chiffres → 400', async () => {
    const res = await request(app)
      .put(`/api/users/${myUserId}`)
      .set('Cookie', cookieHeader)
      .send({ firstName: 'Sara123' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('TC-USER-NEW-06 : Body vide → 400', async () => {
    const res = await request(app)
      .put(`/api/users/${myUserId}`)
      .set('Cookie', cookieHeader)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // ── ID invalide ──────────────────────────────────────────────

  test('TC-USER-NEW-07 : PUT avec ID texte invalide → 400', async () => {
    const res = await request(app)
      .put('/api/users/abc-invalid')
      .set('Cookie', cookieHeader)
      .send({ firstName: 'Test' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('TC-USER-NEW-08 : Cookie falsifié → 401', async () => {
    const res = await request(app)
      .put(`/api/users/${myUserId}`)
      .set('Cookie', 'accessToken=tokenbidon.faux.signature')
      .send({ firstName: 'Test' });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});