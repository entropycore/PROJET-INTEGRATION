'use strict';

const studentProfileService = require('../../services/student/profileService');
const { handleStudentError } = require('../studentHelpers');
const { success } = require('../../utils/apiResponse');

exports.getProfile = async (req, res, next) => {
  try {
    const profile = await studentProfileService.getStudentProfile(req.user.userId);
    return success(res, 200, 'Profil étudiant chargé.', profile);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getProfileCompat = async (req, res, next) => {
  try {
    const profile = await studentProfileService.getStudentProfileCompat(req.user.userId);
    return success(res, 200, 'Profil étudiant chargé.', profile);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.updateProfileCompat = async (req, res, next) => {
  try {
    const profile = await studentProfileService.updateStudentProfileCompat(
      req.user.userId,
      req.body,
    );
    return success(res, 200, 'Profil étudiant mis à jour.', profile);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getCareerGoal = async (req, res, next) => {
  try {
    const careerGoal = await studentProfileService.getStudentCareerGoal(req.user.userId);
    return success(res, 200, 'Objectif professionnel chargé.', careerGoal);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.updateCareerGoal = async (req, res, next) => {
  try {
    const careerGoal = await studentProfileService.updateStudentCareerGoal(
      req.user.userId,
      req.body,
    );
    return success(res, 200, 'Objectif professionnel mis à jour.', careerGoal);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};
