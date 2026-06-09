'use strict';

const professionalService = require('../services/professionalService');
const { success, error } = require('../utils/apiResponse');

const handleProfessionalError = (res, err) => {
  if (err.message === 'PROFESSIONAL_PROFILE_NOT_FOUND') {
    return error(res, 404, 'Profil professionnel introuvable.');
  }

  if (err.message === 'PROFILE_PICTURE_UPLOAD_EMPTY') {
    return error(res, 400, 'Ajoutez une photo de profil.');
  }

  return null;
};

exports.getDashboard = async (req, res, next) => {
  try {
    const dashboard = await professionalService.getProfessionalDashboard(req.user.userId);
    return success(res, 200, 'Tableau de bord professionnel chargé.', dashboard);
  } catch (err) {
    if (handleProfessionalError(res, err)) return;
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const profile = await professionalService.getProfessionalProfile(req.user.userId);
    return success(res, 200, 'Profil professionnel chargé.', profile);
  } catch (err) {
    if (handleProfessionalError(res, err)) return;
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const profile = await professionalService.updateProfessionalProfile(
      req.user.userId,
      req.body,
    );
    return success(res, 200, 'Profil professionnel mis a jour.', profile);
  } catch (err) {
    if (handleProfessionalError(res, err)) return;
    next(err);
  }
};

exports.uploadProfilePicture = async (req, res, next) => {
  try {
    const result = await professionalService.updateProfessionalProfilePicture(
      req.user.userId,
      req.file,
    );
    return success(res, 200, 'Photo de profil mise a jour.', result);
  } catch (err) {
    if (handleProfessionalError(res, err)) return;
    next(err);
  }
};

exports.listProfiles = async (req, res, next) => {
  try {
    const profiles = await professionalService.listPublicProfiles(req.query);
    return success(res, 200, 'Profils publics charges.', profiles);
  } catch (err) {
    if (handleProfessionalError(res, err)) return;
    next(err);
  }
};
