'use strict';

exports.getDashboard = (req, res) => {
  res.json({
    success: true,
    message: 'Acces autorise a l espace professeur',
    data: {
      area: 'professor',
      user: req.user,
    },
  });
};

exports.getProfile = (req, res) => {
  res.json({
    success: true,
    message: 'Profil professeur accessible',
    data: {
      user: req.user,
    },
  });
};
