'use strict';

const helpers = require('../../../src/controllers/administratorHelpers');

describe('UNIT TESTS - administratorHelpers', () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(val => val),
    };
  });

  describe('parseBooleanFilter', () => {
    it('devrait retourner true pour "true"', () => {
      expect(helpers.parseBooleanFilter('true')).toBe(true);
    });

    it('devrait retourner false pour "false"', () => {
      expect(helpers.parseBooleanFilter('false')).toBe(false);
    });

    it('devrait retourner undefined pour undefined', () => {
      expect(helpers.parseBooleanFilter(undefined)).toBeUndefined();
    });

    it('devrait retourner null pour toute autre valeur', () => {
      expect(helpers.parseBooleanFilter('not-a-bool')).toBeNull();
      expect(helpers.parseBooleanFilter('')).toBeNull();
    });
  });

  describe('parsePositiveInt', () => {
    it('devrait retourner la valeur parsée si elle est >= 1', () => {
      expect(helpers.parsePositiveInt('5', 10)).toBe(5);
      expect(helpers.parsePositiveInt('1', 10)).toBe(1);
    });

    it('devrait retourner le fallback pour des valeurs invalides ou < 1', () => {
      expect(helpers.parsePositiveInt('0', 10)).toBe(10);
      expect(helpers.parsePositiveInt('-5', 10)).toBe(10);
      expect(helpers.parsePositiveInt('not-an-int', 10)).toBe(10);
    });
  });

  describe('normalizeRole et normalizeStatus', () => {
    it('devrait mettre en majuscule', () => {
      expect(helpers.normalizeRole('student')).toBe('STUDENT');
      expect(helpers.normalizeStatus('active')).toBe('ACTIVE');
    });

    it('devrait retourner la valeur si non string', () => {
      expect(helpers.normalizeRole(null)).toBeNull();
      expect(helpers.normalizeStatus(undefined)).toBeUndefined();
    });
  });

  describe('normalizeItemType', () => {
    it('devrait normaliser et remplacer les tirets par des underscores', () => {
      expect(helpers.normalizeItemType('certificate-validation')).toBe('CERTIFICATE_VALIDATION');
    });

    it('devrait retourner la valeur si non string', () => {
      expect(helpers.normalizeItemType(123)).toBe(123);
    });
  });

  describe('getReportStatusFilter', () => {
    it('devrait renvoyer PENDING par defaut', () => {
      expect(helpers.getReportStatusFilter(undefined)).toBe('PENDING');
    });

    it('devrait renvoyer null pour ALL', () => {
      expect(helpers.getReportStatusFilter('ALL')).toBeNull();
    });

    it('devrait renvoyer APPROVED pour RESOLVED', () => {
      expect(helpers.getReportStatusFilter('RESOLVED')).toBe('APPROVED');
    });

    it('devrait renvoyer le statut normalise', () => {
      expect(helpers.getReportStatusFilter('rejected')).toBe('REJECTED');
    });
  });

  describe('readBodyText', () => {
    it('devrait lire et trimmer le premier champ trouve dans le body', () => {
      const body = { reason: '  inapproprie  ', desc: 'test' };
      expect(helpers.readBodyText(body, ['reason', 'desc'])).toBe('inapproprie');
    });

    it('devrait essayer les champs suivants si le premier est absent', () => {
      const body = { desc: 'test' };
      expect(helpers.readBodyText(body, ['reason', 'desc'])).toBe('test');
    });

    it('devrait renvoyer null si aucun champ trouve ou vide', () => {
      const body = { reason: '   ' };
      expect(helpers.readBodyText(body, ['reason', 'desc'])).toBeNull();
      expect(helpers.readBodyText({}, ['reason'])).toBeNull();
    });
  });

  describe('handleAdminError', () => {
    it('devrait retourner la reponse correcte pour une erreur admin (ex: USER_NOT_FOUND)', () => {
      const err = new Error('USER_NOT_FOUND');
      const result = helpers.handleAdminError(mockRes, err);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Utilisateur introuvable.',
      });
      expect(result).toBeDefined();
    });

    it('devrait retourner la reponse correcte pour une erreur prisma unique constraint (P2002)', () => {
      const err = { code: 'P2002', message: 'Unique key constraint fail' };
      const result = helpers.handleAdminError(mockRes, err);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Une valeur unique existe déjà en base.',
      });
      expect(result).toBeDefined();
    });

    it('devrait retourner null pour une erreur inconnue', () => {
      const err = new Error('UNKNOWN_ERROR');
      const result = helpers.handleAdminError(mockRes, err);

      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
});
