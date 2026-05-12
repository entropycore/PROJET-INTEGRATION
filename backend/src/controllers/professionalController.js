'use strict';

const { success } = require('../utils/apiResponse');

exports.getDashboard = (req, res) => {
  return success(
    res,
    200,
    'Acces autorise a l espace professionnel',
    {
      area: 'professional',
      user: req.user,
    }
  );
};

exports.getProfile = (req, res) => {
  return success(
    res,
    200,
    'Profil professionnel accessible',
    {
      user: req.user,
    }
  );
};
