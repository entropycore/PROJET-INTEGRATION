'use strict';

const request = require('supertest');
const app = require('../../../src/server');
const jwt = require('jsonwebtoken');
const prisma = require('../../../src/config/prisma');
const { hashToken } = require('../../../src/utils/tokenHash');

describe('MIDDLEWARE - verifyRefreshToken', () => {

  // ─── CAS 1 : Sans refresh token ───────────────────
  test('TC-VRT-01 : Sans cookie → 401 + message manquant', async () => {
    const res = await request(app)
      .post('/api/auth/refresh-token');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/manquant/i);
  });

  // ─── CAS 2 : Token falsifié ───────────────────────
  test('TC-VRT-02 : Refresh token falsifié → 401 + message invalide', async () => {
    const res = await request(app)
      .post('/api/auth/refresh-token')
      .set('Cookie', 'refreshToken=tokenbidon.faux.signature');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalide/i);
  });

  // ─── CAS 3 : Token expiré ─────────────────────────
  test('TC-VRT-03 : Refresh token expiré → 401 + message expirée', async () => {
    const expiredToken = jwt.sign(
      { userId: 'test-id' },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '-1s' } // ← expiré
    );

    const res = await request(app)
      .post('/api/auth/refresh-token')
      .set('Cookie', `refreshToken=${expiredToken}`);

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/expir/i);
  });

  // ─── CAS 4 : Token valide ─────────────────────────
  test('TC-VRT-04 : Refresh token valide → middleware laisse passer', async () => {
    // 1. Créer ou récupérer un utilisateur réel
    const testUser = await prisma.user.upsert({
      where: { email: 'qa.test@ensa.ma' },
      update: { accountStatus: 'ACTIVE' },
      create: {
        email: 'qa.test@ensa.ma',
        passwordHash: 'hashed_pass',
        firstName: 'Najim',
        lastName: 'QA',
        role: 'STUDENT',
        accountStatus: 'ACTIVE',
      }
    });

    // 2. Signer avec le VRAI secret du .env — ne jamais modifier process.env
    const validToken = jwt.sign(
      { userId: testUser.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    // 3. Stocker le hash du token (comme le fait authService)
    await prisma.refreshTokenSession.create({
      data: {
        userId: testUser.id,
        tokenHash: hashToken(validToken), // ✅ hash, pas le token brut
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }
    });

    // 4. Requête avec le cookie
    const res = await request(app)
      .post('/api/auth/refresh-token')
      .set('Cookie', `refreshToken=${validToken}`);

    // 5. Nettoyage
    await prisma.refreshTokenSession.deleteMany({ where: { userId: testUser.id } });
    console.log('TC-VRT-04 response:', res.statusCode, res.body);
    // 6. Vérification
    expect(res.statusCode).not.toBe(401);
    expect(res.statusCode).toBe(200);
  }, 15000);

  // ─── CAS 5 : Mauvais secret ───────────────────────
  test('TC-VRT-05 : Token signé avec mauvais secret → 401', async () => {
    const wrongToken = jwt.sign(
      { userId: 'test-id' },
      'mauvais-secret',
      { expiresIn: '7d' }
    );

    const res = await request(app)
      .post('/api/auth/refresh-token')
      .set('Cookie', `refreshToken=${wrongToken}`);

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});