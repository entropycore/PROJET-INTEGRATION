'use strict';

const professionalService = require('../services/professionalService');
const { success, error } = require('../utils/apiResponse');

const handleProfessionalError = (res, err) => {
  if (err.message === 'PROFESSIONAL_PROFILE_NOT_FOUND') {
    return error(res, 404, 'Profil professionnel introuvable.');
  }

  return null;
};

exports.getDashboard = async (req, res, next) => {
  try {
    const dashboard = await professionalService.getProfessionalDashboard(req.user.userId);
    return success(res, 200, 'Tableau de bord professionnel charge.', dashboard);
  } catch (err) {
    if (handleProfessionalError(res, err)) return;
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const profile = await professionalService.getProfessionalProfile(req.user.userId);
    return success(res, 200, 'Profil professionnel charge.', profile);
  } catch (err) {
    if (handleProfessionalError(res, err)) return;
    next(err);
  }
};
