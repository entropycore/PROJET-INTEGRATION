'use strict';

exports.getDashboard = (req, res) => {
  res.json({
    success: true,
    message: 'Acces autorise a l espace etudiant',
    data: {
      area: 'student',
      user: req.user,
    },
  });
};

exports.getProfile = (req, res) => {
  res.json({
    success: true,
    message: 'Profil etudiant accessible',
    data: {
      user: req.user,
    },
  });
};
