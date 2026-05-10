'use strict';

const { handleErrors, notFound } = require('../../../src/middlewares/handleErrors');
const logger = require('../../../src/logs/logger');

// Mock du logger pour éviter d'écrire dans les fichiers de logs réels pendant les tests
jest.mock('../../../src/logs/logger', () => ({
  error: jest.fn()
}));

describe('UNIT TEST: handleErrors Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Initialisation des objets req et res simulés (Mocks)
    req = { method: 'GET', url: '/test', ip: '127.0.0.1' };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  // --- TEST 1 : Gestion des erreurs de type CORS ---
  test('TC-ERR-01 : Doit retourner 403 pour une erreur CORS', () => {
    const error = new Error('CORS bloqué'); // Simulation d'une erreur contenant le mot 'CORS'

    handleErrors(error, req, res, next);

    // Vérifie que le code de statut HTTP est bien 403 (Forbidden)
    expect(res.status).toHaveBeenCalledWith(403);
    // Vérifie que le message d'erreur envoyé au client est correct
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: expect.stringContaining('Accès refusé')
    }));
  });

  // --- TEST 2 : Gestion des erreurs JWT (Token invalide) ---
  test('TC-ERR-02 : Doit retourner 401 pour un Token invalide', () => {
    const error = new Error();
    error.name = 'JsonWebTokenError'; // Nom de l'erreur généré par la librairie jsonwebtoken

    handleErrors(error, req, res, next);

    // Vérifie que le code de statut HTTP est bien 401 (Unauthorized)
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Token invalide'
    }));
  });

  // --- TEST 3 : Gestion des erreurs de validation des données ---
  test('TC-ERR-03 : Doit retourner 400 pour des données invalides', () => {
    const error = new Error();
    error.name = 'ValidationError';
    error.errors = { email: 'Format invalide' }; // Simulation des détails de validation

    handleErrors(error, req, res, next);

    // Vérifie que le code de statut HTTP est bien 400 (Bad Request)
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      errors: error.errors
    }));
  });

  // --- TEST 4 : Sécurité en environnement de Production ---
  test('TC-ERR-04 : Ne doit pas révéler les détails techniques en Production', () => {
    process.env.NODE_ENV = 'production'; // Passage manuel en mode production
    const error = new Error('Database Connection Failed - Sensitive Data');

    handleErrors(error, req, res, next);

    // Vérifie que le message technique est masqué pour l'utilisateur final
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Erreur serveur'
    }));
    
    // Réinitialisation de l'environnement après le test
    process.env.NODE_ENV = 'test';
  });

  // --- TEST 5 : Gestion des routes inexistantes (404 Not Found) ---
  test('TC-ERR-05 : Doit retourner 404 pour une route inexistante', () => {
    notFound(req, res);

    // Vérifie que le code de statut HTTP est bien 404 (Not Found)
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: expect.stringContaining('introuvable')
    }));
  });
});