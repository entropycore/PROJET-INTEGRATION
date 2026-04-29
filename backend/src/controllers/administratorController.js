'use strict';

exports.getDashboard = (req, res) => {
  res.json({
    success: true,
    message: 'Acces autorise a l espace administrateur',
    data: {
      area: 'administrator',
      user: req.user,
    },
  });
};

exports.getProfile = (req, res) => {
  res.json({
    success: true,
    message: 'Profil administrateur accessible',
    data: {
      user: req.user,
    },
  });
};
