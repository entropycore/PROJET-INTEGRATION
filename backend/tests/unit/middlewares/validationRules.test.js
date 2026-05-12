
const { validationRules, handleValidationErrors } = require('../../../src/middlewares/validationRules');

const runValidation = async (req, res, rules) => {
  for (const middleware of rules) {
    await middleware(req, res, () => {});
  }
};

describe('UNIT TEST: validationRules Middleware', () => {
  let req, res, next;

  // Préparation de l'environnement avant chaque test
  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('Registration Validation', () => {
    
    test('TC-UNIT-VAL-01 : Doit passer si les données sont complètes et valides', async () => {
      req.body = {
        firstName: 'Najim',
        lastName: 'Souad',
        email: 'test@ensa.ac.ma',
        password: 'TestPassword@123',
        company: 'ENSA',
        jobTitle: 'Lead QA'
      };

      await runValidation(req, res, validationRules('register'));
      handleValidationErrors(req, res, next);

      expect(next).toHaveBeenCalled(); 
      expect(res.status).not.toHaveBeenCalled();
    });

    test('TC-UNIT-VAL-02 : Doit bloquer si l\'email est mal formé', async () => {
      req.body = {
        firstName: 'Najim',
        lastName: 'Souad',
        email: 'najim-at-ensa.ma', // Email invalide
        password: 'TestPassword@123'
      };

      await runValidation(req, res, validationRules('register'));
      handleValidationErrors(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
        success: false,
        message: 'Données invalides' 
      }));
      expect(next).not.toHaveBeenCalled();
    });

    test('TC-UNIT-VAL-03 : Doit bloquer si un champ obligatoire manque', async () => {
      req.body = {
        email: 'test@ensa.ac.ma'
        // password manquant
      };

      await runValidation(req, res, validationRules('register'));
      handleValidationErrors(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });
  });
});