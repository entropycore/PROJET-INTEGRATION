'use strict';

const checkRoles = require('../../../src/middlewares/checkRoles');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Protection du rôle utilisateur', () => {

  test('SCRUM-133 : Étudiant ne peut pas accéder à une route professeur', () => {
    const req = { user: { userId: 1, role: 'STUDENT', roleId: 1 } };
    const res = mockRes();
    const next = jest.fn();

    checkRoles('PROFESSOR')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('SCRUM-133 : Professionnel ne peut pas accéder à une route admin', () => {
    const req = { user: { userId: 2, role: 'PROFESSIONAL', roleId: 2 } };
    const res = mockRes();
    const next = jest.fn();

    checkRoles('ADMINISTRATOR')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('SCRUM-133 : Le rôle dans le token ne peut pas être modifié par req.body', () => {
    const req = { 
      user: { userId: 1, role: 'STUDENT', roleId: 1 },
      body: { role: 'ADMINISTRATOR' }
    };
    const res = mockRes();
    const next = jest.fn();

    checkRoles('ADMINISTRATOR')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

});