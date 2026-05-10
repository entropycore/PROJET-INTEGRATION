// tests/unit/middlewares/checkRoles.test.js
'use strict';

const checkRoles = require('../../../src/middlewares/checkRoles');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res); // Mock chainable
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('UNIT TEST: checkRoles Middleware (SCRUM-134)', () => {
  let res, next;

  /**
   * Initialisation des mocks avant chaque test pour garantir l'indépendance.
   */
  beforeEach(() => {
    res = mockRes();
    next = jest.fn();
  });

  describe('Accès Autorisé', () => {
    test('TC-UNIT-ROLE-01 : Doit autoriser un ADMINISTRATOR à accéder à une route protégée par ADMINISTRATOR', () => {
      const req = { user: { userId: 1, role: 'ADMINISTRATOR' } };
      
      checkRoles('ADMINISTRATOR')(req, res, next);

      expect(next).toHaveBeenCalled(); // Succès
      expect(res.status).not.toHaveBeenCalled();
    });

    test('TC-UNIT-ROLE-02 : Doit être insensible à la casse (ex: "administrator" minuscule)', () => {
      const req = { user: { userId: 1, role: 'administrator' } };
      
      checkRoles('ADMINISTRATOR')(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('TC-UNIT-ROLE-03 : Doit autoriser si l\'utilisateur possède l\'un des rôles permis (Multi-roles)', () => {
      const req = { user: { userId: 2, role: 'PROFESSOR' } };
      
      // La route accepte ADMIN ou PROFESSOR
      checkRoles('ADMINISTRATOR', 'PROFESSOR')(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('Accès Refusé', () => {
    test('TC-UNIT-ROLE-04 : Doit bloquer un STUDENT qui tente d\'accéder à une route ADMINISTRATOR (403)', () => {
      const req = { user: { userId: 3, role: 'STUDENT' } };
      
      checkRoles('ADMINISTRATOR')(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Accès refusé — permissions insuffisantes'
      }));
      expect(next).not.toHaveBeenCalled();
    });

    test('TC-UNIT-ROLE-05 : Doit renvoyer 401 si l\'utilisateur n\'est pas authentifié (req.user absent)', () => {
      const req = {}; // Pas de user injecté par authMiddleware
      
      checkRoles('ADMINISTRATOR')(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Authentification requise'
      }));
      expect(next).not.toHaveBeenCalled();
    });

    test('TC-UNIT-ROLE-06 : Doit bloquer si le rôle dans req.user est indéfini ou manquant', () => {
      const req = { user: { userId: 4 } }; // Champ 'role' manquant
      
      checkRoles('ADMINISTRATOR')(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });
}); 