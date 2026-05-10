'use strict';

const professorService = require('../services/professorService');
const { success, error } = require('../utils/apiResponse');

const handleProfessorError = (res, err) => {
  if (err.message === 'PROFESSOR_PROFILE_NOT_FOUND') {
    return error(res, 404, 'Profil professeur introuvable.');
  }

  return null;
};

exports.getDashboard = async (req, res, next) => {
  try {
    const dashboard = await professorService.getProfessorDashboard(req.user.userId);
    return success(res, 200, 'Tableau de bord professeur charge.', dashboard);
  } catch (err) {
    if (handleProfessorError(res, err)) return;
    next(err);
  }
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
