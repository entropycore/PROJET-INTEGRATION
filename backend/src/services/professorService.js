'use strict';

const dashboardService = require('./professor/dashboardService');
const profileService = require('./professor/profileService');
const validationService = require('./professor/validationService');

module.exports = {
  ...dashboardService,
  ...profileService,
  ...validationService,
};
