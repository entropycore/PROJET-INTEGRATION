'use strict';

const professionalService = require('../services/professionalService');
const { success, error } = require('../utils/apiResponse');

const handleProfessionalError = (res, err) => {
  if (err.message === 'PROFESSIONAL_PROFILE_NOT_FOUND') {
    return error(res, 404, 'Profil professionnel introuvable.');
  }

  return null;
};

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

exports.getProfile = async (req, res, next) => {
  try {
    const profile = await professionalService.getProfessionalProfile(req.user.userId);
    return success(res, 200, 'Profil professionnel charge.', profile);
  } catch (err) {
    if (handleProfessionalError(res, err)) return;
    next(err);
  }
};
