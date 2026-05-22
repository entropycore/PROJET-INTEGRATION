'use strict';
const studentActivityService = require('../services/studentActivityService');
const { success, error } = require('../utils/apiResponse');

const handleActivityError = (res, err) => {
  if (err.message === 'STUDENT_PROFILE_NOT_FOUND') {
    return error(res, 404, 'Profil étudiant introuvable.');
  }
  if (err.message === 'ACTIVITY_NOT_FOUND') {
    return error(res, 404, 'Activité introuvable.');
  }
  return null;
};

exports.listActivities = async (req, res, next) => {
  try {
    const data = await studentActivityService.listActivities(req.user.userId);
    return success(res, 200, 'Activités parascolaires chargées.', data);
  } catch (err) {
    if (handleActivityError(res, err)) return;
    next(err);
  }
};

exports.getActivityById = async (req, res, next) => {
  try {
    const data = await studentActivityService.getActivityById(req.user.userId, req.params.activityId);
    return success(res, 200, 'Activité chargée.', data);
  } catch (err) {
    if (handleActivityError(res, err)) return;
    next(err);
  }
};