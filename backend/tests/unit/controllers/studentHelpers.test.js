'use strict';

const { handleStudentError } = require('../../../src/controllers/studentHelpers');

describe('UNIT TESTS - studentHelpers', () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(val => val),
    };
  });

  it('devrait retourner la reponse correspondante pour une erreur connue (ex: STUDENT_PROFILE_NOT_FOUND)', () => {
    const err = new Error('STUDENT_PROFILE_NOT_FOUND');
    const result = handleStudentError(mockRes, err);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Profil étudiant introuvable.',
    });
    expect(result).toBeDefined();
  });

  it('devrait retourner la reponse correspondante pour une autre erreur connue (ex: GITHUB_NOT_CONFIGURED)', () => {
    const err = new Error('GITHUB_NOT_CONFIGURED');
    const result = handleStudentError(mockRes, err);

    expect(mockRes.status).toHaveBeenCalledWith(503);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Intégration GitHub non configurée.',
    });
    expect(result).toBeDefined();
  });

  it('devrait retourner null et ne pas appeler res pour une erreur inconnue', () => {
    const err = new Error('UNKNOWN_ERROR');
    const result = handleStudentError(mockRes, err);

    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });
});
