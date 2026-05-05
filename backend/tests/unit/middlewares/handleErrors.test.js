'use strict';

const { handleErrors, notFound } = require('../../../src/middlewares/handleErrors');
const logger = require('../../../src/logs/logger');

// كنـmock-يو الـ logger باش ما يسجلش فـ الملفات الحقيقية وسط التيست
jest.mock('../../../src/logs/logger', () => ({
  error: jest.fn()
}));

describe('UNIT TEST: handleErrors Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // إعداد كائنات وهمية (Mocks) للـ Request و Response
    req = { method: 'GET', url: '/test', ip: '127.0.0.1' };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  // --- الاختبار 1: التعامل مع أخطاء CORS ---
  test('TC-ERR-01 : Doit retourner 403 pour une erreur CORS', () => {
    const error = new Error('CORS bloqué');

    handleErrors(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: expect.stringContaining('Accès refusé')
    }));
  });

  // --- الاختبار 2: التعامل مع أخطاء JWT ---
  test('TC-ERR-02 : Doit retourner 401 pour un Token invalide', () => {
    const error = new Error();
    error.name = 'JsonWebTokenError';

    handleErrors(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Token invalide'
    }));
  });

  // --- الاختبار 3: التعامل مع أخطاء Validation ---
  test('TC-ERR-03 : Doit retourner 400 pour des données invalides', () => {
    const error = new Error();
    error.name = 'ValidationError';
    error.errors = { email: 'Invalid format' };

    handleErrors(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      errors: error.errors
    }));
  });

  // --- الاختبار 4: حماية المعلومات فـ الـ Production ---
  test('TC-ERR-04 : Ne doit pas révéler les détails techniques en Production', () => {
    process.env.NODE_ENV = 'production';
    const error = new Error('Secret DB Credentials Exposed!');

    handleErrors(error, req, res, next);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Erreur serveur'
    }));
    // كنرجعو الـ env للحالة العادية
    process.env.NODE_ENV = 'test';
  });

  // --- الاختبار 5: اختبار Route Introuvable (404) ---
  test('TC-ERR-05 : Doit retourner 404 pour une route inexistante', () => {
    notFound(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('introuvable')
    }));
  });
});