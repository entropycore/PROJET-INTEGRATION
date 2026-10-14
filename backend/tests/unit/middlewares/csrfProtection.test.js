'use strict';

const { generateCsrfToken, doubleCsrfProtection } = require('../../../src/middlewares/csrfProtection');

describe('MIDDLEWARE - csrfProtection', () => {
  test('TC-CSRF-01 : Doit exporter generateCsrfToken et doubleCsrfProtection', () => {
    expect(typeof generateCsrfToken).toBe('function');
    expect(typeof doubleCsrfProtection).toBe('function');
  });

  test('TC-CSRF-02 : En mode test (NODE_ENV=test), le middleware passe sans vérification CSRF', () => {
    const next = jest.fn();
    doubleCsrfProtection({}, {}, next);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
