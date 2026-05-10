'use strict';

const professorService = require('../services/professorService');
const { success, error } = require('../utils/apiResponse');

const handleProfessorError = (res, err) => {
  if (err.message === 'PROFESSOR_PROFILE_NOT_FOUND') {
    return error(res, 404, 'Profil professeur introuvable.');
  }

  return null;
};

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

exports.getProfile = async (req, res, next) => {
  try {
    const profile = await professorService.getProfessorProfile(req.user.userId);
    return success(res, 200, 'Profil professeur charge.', profile);
  } catch (err) {
    if (handleProfessorError(res, err)) return;
    next(err);
  }
};
