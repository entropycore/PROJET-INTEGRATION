'use strict';

const checkRoles = require('../middlewares/checkRoles');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('checkRoles - Contrôle accès par rôle', () => {

  test('SCRUM-134 : Étudiant ne peut pas accéder à une route admin', () => {
    const req = { user: { userId: 1, role: 'STUDENT', roleId: 1 } };
    const res = mockRes();
    const next = jest.fn();

    checkRoles('ADMINISTRATOR')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('SCRUM-134 : Admin peut accéder à une route admin', () => {
    const req = { user: { userId: 1, role: 'ADMINISTRATOR', roleId: 1 } };
    const res = mockRes();
    const next = jest.fn();

    checkRoles('ADMINISTRATOR')(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('SCRUM-134 : Utilisateur sans token reçoit 401', () => {
    const req = {};
    const res = mockRes();
    const next = jest.fn();

    checkRoles('ADMINISTRATOR')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

});