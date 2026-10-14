'use strict';

const { sanitizeInputs } = require('../../../src/middlewares/sanitize');

describe('UNIT TEST: sanitizeInputs Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Initialisation des objets simulés
    req = { body: {} };
    res = {};
    next = jest.fn(); // On simule la fonction next() pour vérifier son appel
  });

  // --- TEST 1 : Nettoyage des espaces ---
  test('TC-SAN-01 : Doit supprimer les espaces au début et à la fin des chaînes', () => {
    req.body = {
      username: '  najim_lead  ',
      email: ' test@example.com   '
    };

    sanitizeInputs(req, res, next);

    // Vérifie que les espaces ont été supprimés (trim)
    expect(req.body.username).toBe('najim_lead');
    expect(req.body.email).toBe('test@example.com');
    // Vérifie que le middleware passe au suivant
    expect(next).toHaveBeenCalled();
  });

  // --- TEST 2 : Ignorer les types non-string ---
  test('TC-SAN-02 : Ne doit pas modifier les types autres que string', () => {
    req.body = {
      age: 25,
      isAdmin: true,
      data: null
    };

    sanitizeInputs(req, res, next);

    // Vérifie que les valeurs restent identiques
    expect(req.body.age).toBe(25);
    expect(req.body.isAdmin).toBe(true);
    expect(req.body.data).toBeNull();
    expect(next).toHaveBeenCalled();
  });

  // --- TEST 3 : Gestion d'un body vide ---
  test('TC-SAN-03 : Doit fonctionner correctement si le body est vide', () => {
    req.body = {};

    sanitizeInputs(req, res, next);

    expect(req.body).toEqual({});
    expect(next).toHaveBeenCalled();
  });

  // --- TEST 4 : Absence de body ---
  test('TC-SAN-04 : Ne doit pas crash si req.body est absent', () => {
    delete req.body;

    // L'exécution ne doit pas lancer d'erreur
    expect(() => sanitizeInputs(req, res, next)).not.toThrow();
    expect(next).toHaveBeenCalled();
  });
});