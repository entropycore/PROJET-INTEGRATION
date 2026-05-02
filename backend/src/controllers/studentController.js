'use strict';

const { success } = require('../utils/apiResponse');

exports.getDashboard = (req, res) => {
  return success(
    res,
    200,
    'Acces autorise a l espace etudiant',
    {
      area: 'student',
      user: req.user,
    }
  );
};

exports.getProfile = (req, res) => {
  return success(
    res,
    200,
    'Profil etudiant accessible',
    {
      user: req.user,
    }
  );
};
