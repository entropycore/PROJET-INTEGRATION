'use strict';

module.exports = {
  ...require('./student/dashboardService'),
  ...require('./student/profileService'),
  ...require('./student/academicPathService'),
  ...require('./student/skillService'),
  ...require('./student/settingsService'),
  ...require('./student/notificationService'),
  ...require('./student/githubImportService'),
};
