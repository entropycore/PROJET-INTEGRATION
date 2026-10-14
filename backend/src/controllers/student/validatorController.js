'use strict';

const validatorService = require('../../services/student/validatorService');
const { handleStudentError } = require('../studentHelpers');
const { success } = require('../../utils/apiResponse');

exports.listValidators = async (_req, res, next) => {
  try {
    const validators = await validatorService.listStudentValidators();
    return success(res, 200, 'Validateurs chargés.', validators);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};
