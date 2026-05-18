// On teste le comportement CORS via des requêtes HTTP
'use strict';

const request = require('supertest');
const app     = require('../../../src/server');

describe('MIDDLEWARE - corsOptions', () => {

  // ─── CAS 1 : Origine autorisée ────────────────────
  test('TC-CORS-01 : Origine localhost:5173 → autorisée', async () => {//Vérifie que le Frontend de développement (Vite) peut communiquer avec l'API
    const res = await request(app)
      .get('/api/auth/me')
      .set('Origin', 'http://localhost:5173');

    expect(res.headers['access-control-allow-origin'])
      .toBe('http://localhost:5173');
  });

  test('TC-CORS-02 : Origine localhost:4173 → autorisée', async () => {//Vérifie que le port de preview (souvent utilisé après un build) est également autorisé
    const res = await request(app)
      .get('/api/auth/me')
      .set('Origin', 'http://localhost:4173');

    expect(res.headers['access-control-allow-origin'])
      .toBe('http://localhost:4173');
  });

  // ─── CAS 2 : Origine non autorisée ───────────────

  test('TC-CORS-03 : Origine non autorisée → retourne 500 CORS error', async () => {// Vérifie que le serveur renvoie explicitement une erreur pour bloquer la requête d'un domaine interdit
    const res = await request(app)
      .get('/api/auth/me')
      .set('Origin', 'http://hacker.com');

    // CORS bloque → erreur retournée
    expect([403, 500]).toContain(res.statusCode);
  });

  // ─── CAS 3 : Credentials ──────────────────────────
  test('TC-CORS-04 : credentials: true → header allow-credentials présent', async () => {//Vérifie que le navigateur est autorisé à envoyer les Cookies/JWT
    const res = await request(app)
      .get('/api/auth/me')
      .set('Origin', 'http://localhost:5173');

    expect(res.headers['access-control-allow-credentials'])
      .toBe('true');
  });

  // ─── CAS 4 : Méthodes autorisées ──────────────────

  test('TC-CORS-05 : OPTIONS preflight → headers autorisés retournés', async () => {//S'assure que l'API accepte les headers spécifiques comme Authorization et Content-Type
    const res = await request(app)
      .options('/api/auth/login')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Headers', 'Content-Type');

    expect(res.headers['access-control-allow-headers'])
      .toMatch(/Content-Type/i);
  });


  // ─── CAS 5 : exposedHeaders ───────────────────────
  test('TC-CORS-06 : X-Total-Count exposé dans les headers', async () => {//S'assure que le Frontend peut lire les headers personnalisés
    const res = await request(app)
      .get('/api/auth/me')
      .set('Origin', 'http://localhost:5173');

    expect(res.headers['access-control-expose-headers'])
      .toMatch(/X-Total-Count/i);
  });
});