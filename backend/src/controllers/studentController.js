'use strict';

const studentService = require('../services/studentService');
const { success, error } = require('../utils/apiResponse');

const handleStudentError = (res, err) => {
  if (err.message === 'STUDENT_PROFILE_NOT_FOUND') {
    return error(res, 404, 'Profil etudiant introuvable.');
  }

  return null;
};

exports.getDashboard = async (req, res, next) => {
  try {
    const dashboard = await studentService.getStudentDashboard(req.user.userId);
    return success(res, 200, 'Tableau de bord etudiant charge.', dashboard);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const profile = await studentService.getStudentProfile(req.user.userId);
    return success(res, 200, 'Profil etudiant charge.', profile);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};
