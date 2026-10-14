'use strict';

const administratorService = require('../../services/administratorService');
const { handleAdminError } = require('../administratorHelpers');
const { success } = require('../../utils/apiResponse');

exports.getProfile = async (req, res, next) => {
  try {
    const profile = await administratorService.getAdministratorProfile(req.user.userId);
    return success(res, 200, 'Profil administrateur chargé.', profile);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};
