// tests/unit/middlewares/authMiddleware.test.js
'use strict';

const jwt = require('jsonwebtoken');
const authMiddleware = require('../../../src/middlewares/authMiddleware');
const logger = require('../../../src/logs/logger');

/**
 * Mocking des dépendances externes
 * On remplace les vraies fonctions par des versions contrôlées par Jest.
 */
jest.mock('jsonwebtoken');
jest.mock('../../../src/logs/logger');

describe('UNIT TEST: authMiddleware', () => {
  let req, res, next;

  /**
   * Initialisation de l'environnement de test avant chaque cas.
   */
  beforeEach(() => {
    req = { 
      cookies: {}, 
      method: 'GET', 
      url: '/api/test', 
      ip: '127.0.0.1' 
    };
    res = { 
      status: jest.fn().mockReturnThis(), 
      json: jest.fn() 
    };
    next = jest.fn();
    
    // On définit le secret d'environnement pour le test
    process.env.ACCESS_TOKEN_SECRET = 'test_secret_123';

    // Nettoyage des mocks pour repartir à zéro
    jest.clearAllMocks();
  });

  // --- GROUPE 1 : ABSENCE DE TOKEN ---

  test('TC-UNIT-AUTH-01 : Doit bloquer si le cookie accessToken est absent (401)', () => {
    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Accès refusé — authentification requise'
    }));
    expect(next).not.toHaveBeenCalled();
  });

  // --- GROUPE 2 : TOKEN VALIDE ---

  test('TC-UNIT-AUTH-02 : Doit injecter req.user et appeler next() si le token est valide', () => {
    const mockDecoded = { userId: 'user-123', role: 'ADMIN', roleId: 1 };
    req.cookies.accessToken = 'valid.token.here';

    // On simule un décodage réussi par JWT
    jwt.verify.mockReturnValue(mockDecoded);

    authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('valid.token.here', 'test_secret_123');
    expect(req.user).toEqual(mockDecoded);
    expect(logger.info).toHaveBeenCalled(); // Vérifie que l'accès autorisé est loggé
    expect(next).toHaveBeenCalled();
  });

  // --- GROUPE 3 : GESTION DES ERREURS (CATCH) ---

  test('TC-UNIT-AUTH-03 : Doit renvoyer 401 et logger une erreur si le token est expiré', () => {
    req.cookies.accessToken = 'expired.token.here';

    // On simule une erreur d'expiration jetée par JWT
    jwt.verify.mockImplementation(() => {
      const err = new Error('Expired');
      err.name = 'TokenExpiredError';
      throw err;
    });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringMatching(/expir/i)
    }));
    expect(logger.warn).toHaveBeenCalled(); // Vérifie que la tentative échouée est loggée
    expect(next).not.toHaveBeenCalled();
  });

  test('TC-UNIT-AUTH-04 : Doit renvoyer 401 si le token est invalide ou corrompu', () => {
    req.cookies.accessToken = 'invalid.token.here';

    // On simule une erreur de signature invalide
    jwt.verify.mockImplementation(() => {
      const err = new Error('Invalid');
      err.name = 'JsonWebTokenError';
      throw err;
    });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Token invalide'
    }));
    expect(logger.warn).toHaveBeenCalledWith(expect.objectContaining({
      error: 'JsonWebTokenError'
    }));
    expect(next).not.toHaveBeenCalled();
  });
});