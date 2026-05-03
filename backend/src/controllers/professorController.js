'use strict';

const { success } = require('../utils/apiResponse');

exports.getDashboard = (req, res) => {
  return success(
    res,
    200,
    'Acces autorise a l espace professeur',
    {
      area: 'professor',
      user: req.user,
    }
  );
};

exports.getProfile = (req, res) => {
  return success(
    res,
    200,
    'Profil professeur accessible',
    {
      user: req.user,
    }
  );
};
