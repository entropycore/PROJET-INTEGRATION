'use strict';

const dashboardService = require('./professor/dashboardService');
const profileService = require('./professor/profileService');
const settingsService = require('./professor/settingsService');
const validationService = require('./professor/validationService');

module.exports = {
  ...dashboardService,
  ...profileService,
  ...settingsService,
  ...validationService,
};
