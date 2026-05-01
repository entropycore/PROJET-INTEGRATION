'use strict';

const { success } = require('../utils/apiResponse');

exports.getDashboard = (req, res) => {
  return success(
    res,
    200,
    'Acces autorise a l espace administrateur',
    {
      area: 'administrator',
      user: req.user,
    }
  );
};

exports.getProfile = (req, res) => {
  return success(
    res,
    200,
    'Profil administrateur accessible',
    {
      user: req.user,
    }
  );
};
