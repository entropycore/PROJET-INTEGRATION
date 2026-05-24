'use strict';

const studentSettingsService = require('../../services/student/settingsService');
const { handleStudentError } = require('../studentHelpers');
const { success } = require('../../utils/apiResponse');

exports.getSettings = async (req, res, next) => {
  try {
    const settings = await studentSettingsService.getStudentSettings(req.user.userId);
    return success(res, 200, 'Paramètres étudiant chargés.', settings);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.updateSettingsPassword = async (req, res, next) => {
  try {
    const result = await studentSettingsService.updateStudentSettingsPassword(
      req.user.userId,
      req.body,
    );
    return success(res, 200, 'Mot de passe étudiant mis à jour.', result);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.updateSettingsPrivacy = async (req, res, next) => {
  try {
    const settings = await studentSettingsService.updateStudentSettingsPrivacy(
      req.user.userId,
      req.body,
    );
    return success(res, 200, 'Préférences de confidentialité mises à jour.', settings);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.updateSettingsNotifications = async (req, res, next) => {
  try {
    const settings = await studentSettingsService.updateStudentSettingsNotifications(
      req.user.userId,
      req.body,
    );
    return success(res, 200, 'Préférences de notification mises à jour.', settings);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};
