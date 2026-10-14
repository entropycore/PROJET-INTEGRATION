'use strict';

const request = require('supertest');
const app = require('../../../src/server');

describe('MIDDLEWARE - csrfProtection (Integration)', () => {
  test('TC-CSRF-03 : GET /api/auth/csrf-token doit retourner un csrfToken valide', async () => {
    const res = await request(app).get('/api/auth/csrf-token');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('csrfToken');
    expect(typeof res.body.csrfToken).toBe('string');
    expect(res.body.csrfToken.length).toBeGreaterThan(10);
  });
});
