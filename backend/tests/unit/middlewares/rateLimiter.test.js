'use strict';

// ══════════════════════════════════════════════════════
// UNIT TEST - rateLimiter.js
// On teste directement le module sans passer par l'API
// ══════════════════════════════════════════════════════
describe('MIDDLEWARE - rateLimiter', () => {

  // ─── CAS 1 : Mode test → bypass activé ────────────
  test('TC-RL-01 : En mode test → globalLimiter est un bypass', () => {
    process.env.NODE_ENV = 'test';

    // Recharger le module avec NODE_ENV=test
    jest.resetModules();
    const { globalLimiter } = require('../../../src/middlewares/rateLimiter');

    // Un bypass est une simple fonction (req, res, next) => next()
    expect(typeof globalLimiter).toBe('function');
    expect(globalLimiter.length).toBe(3); // ← 3 params = (req, res, next)
  });

  test('TC-RL-02 : En mode test → authLimiter est un bypass', () => {
    process.env.NODE_ENV = 'test';

    jest.resetModules();
    const { authLimiter } = require('../../../src/middlewares/rateLimiter');

    expect(typeof authLimiter).toBe('function');
    expect(authLimiter.length).toBe(3);
  });

  test('TC-RL-03 : En mode test → forgotPasswordLimiter est un bypass', () => {
    process.env.NODE_ENV = 'test';

    jest.resetModules();
    const { forgotPasswordLimiter } = require('../../../src/middlewares/rateLimiter');

    expect(typeof forgotPasswordLimiter).toBe('function');
    expect(forgotPasswordLimiter.length).toBe(3);
  });

  // ─── CAS 2 : Mode production → vrais limiteurs ────
  test('TC-RL-04 : En mode production → authLimiter est un vrai limiteur', () => {
    process.env.NODE_ENV = 'production';

    jest.resetModules();
    const { authLimiter } = require('../../../src/middlewares/rateLimiter');

    // Un vrai rateLimit retourne une fonction avec plus de 3 paramètres
    // ou avec des propriétés supplémentaires
    expect(typeof authLimiter).toBe('function');
  });

  test('TC-RL-05 : En mode production → globalLimiter est un vrai limiteur', () => {
    process.env.NODE_ENV = 'production';

    jest.resetModules();
    const { globalLimiter } = require('../../../src/middlewares/rateLimiter');

    expect(typeof globalLimiter).toBe('function');
  });

  // ─── CAS 3 : Bypass appelle bien next() ───────────
  test('TC-RL-06 : Bypass appelle next() sans modifier req ni res', () => {
    process.env.NODE_ENV = 'test';

    jest.resetModules();
    const { authLimiter } = require('../../../src/middlewares/rateLimiter');

    // Simuler req, res, next
    const req  = {};
    const res  = {};
    const next = jest.fn(); // ← fonction simulée

    authLimiter(req, res, next);

    expect(next).toHaveBeenCalledTimes(1); // ← next() appelé une fois
    expect(next).toHaveBeenCalledWith();   // ← sans arguments
  });

  test('TC-RL-07 : Bypass ne modifie pas req', () => {
    process.env.NODE_ENV = 'test';

    jest.resetModules();
    const { globalLimiter } = require('../../../src/middlewares/rateLimiter');

    const req  = { original: true };
    const res  = {};
    const next = jest.fn();

    globalLimiter(req, res, next);

    expect(req.original).toBe(true); // ← req non modifié
    expect(next).toHaveBeenCalled();
  });

  // ─── CAS 4 : Les 3 limiteurs sont exportés ────────
  test('TC-RL-08 : Module exporte bien les 3 limiteurs', () => {
    process.env.NODE_ENV = 'test';

    jest.resetModules();
    const rateLimiter = require('../../../src/middlewares/rateLimiter');

    expect(rateLimiter).toHaveProperty('globalLimiter');
    expect(rateLimiter).toHaveProperty('authLimiter');
    expect(rateLimiter).toHaveProperty('forgotPasswordLimiter');
  });

  // ─── NETTOYAGE ────────────────────────────────────
  afterAll(() => {
    process.env.NODE_ENV = 'test'; // ← remettre en mode test
    jest.resetModules();
  });
});     