const request = require('supertest'); 
const app = require('../../../src/server');
describe('MIDDLEWARE - securityHeaders (Optimized)', () => {
  
  test('TC-SEC-CORE : Doit inclure les protections fondamentales (XSS, Sniff, Clickjacking, Hidden Tech)', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('DENY');
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['x-xss-protection']).toBeDefined();
  });

  test('TC-SEC-CSP-HSTS : Doit configurer correctement la CSP et le HSTS (Production Ready)', async () => {
    const res = await request(app).get('/api/auth/me');

    // Vérification CSP
    expect(res.headers['content-security-policy']).toMatch(/default-src 'self'/);
    expect(res.headers['content-security-policy']).toMatch(/frame-ancestors 'none'/);
    
    // Vérification HSTS
    expect(res.headers['strict-transport-security']).toMatch(/max-age=31536000/);
    expect(res.headers['strict-transport-security']).toMatch(/includeSubDomains/);
  });

  test('TC-SEC-GLOBAL : La protection doit être active même sur les erreurs 404', async () => {
    const res = await request(app).get('/api/route-inexistante');
    
    expect(res.headers['x-frame-options']).toBe('DENY');
    expect(res.headers['content-security-policy']).toBeDefined();
  });

});