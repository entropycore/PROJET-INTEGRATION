'use strict';

exports.getDashboard = (req, res) => {
  res.json({
    success: true,
    message: 'Acces autorise a l espace professionnel',
    data: {
      area: 'professional',
      user: req.user,
    },
  });
};

exports.getProfile = (req, res) => {
  res.json({
    success: true,
    message: 'Profil professionnel accessible',
    data: {
      user: req.user,
    },
  });
};
