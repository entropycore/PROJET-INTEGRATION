'use strict';

module.exports = {
  ...require('./studentWorkspace/validatorController'),
  ...require('./studentWorkspace/projectController'),
  ...require('./studentWorkspace/stageController'),
  ...require('./studentWorkspace/activityController'),
  ...require('./studentWorkspace/portfolioController'),
  ...require('./studentWorkspace/profileController'),
  ...require('./studentWorkspace/skillController'),
  ...require('./studentWorkspace/settingsController'),
  ...require('./studentWorkspace/recommendationController'),
  ...require('./studentWorkspace/dashboardExtraController'),
};
