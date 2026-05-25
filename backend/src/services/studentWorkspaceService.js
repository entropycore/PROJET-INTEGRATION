'use strict';

module.exports = {
  ...require('./studentWorkspace/validatorService'),
  ...require('./studentWorkspace/projectService'),
  ...require('./studentWorkspace/stageService'),
  ...require('./studentWorkspace/activityService'),
  ...require('./studentWorkspace/portfolioService'),
  ...require('./studentWorkspace/profileService'),
  ...require('./studentWorkspace/skillService'),
  listSoftSkills: (userId) => require('./studentWorkspace/skillService').listStudentSkills(userId, 'SOFT_SKILL'),
  addSoftSkill: (userId, payload) => require('./studentWorkspace/skillService').addStudentSkill(userId, payload, 'SOFT_SKILL'),
  ...require('./studentWorkspace/settingsService'),
  ...require('./studentWorkspace/recommendationService'),
  ...require('./studentWorkspace/dashboardService'),
};
