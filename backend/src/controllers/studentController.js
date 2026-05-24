'use strict';

module.exports = {
  ...require('./student/dashboardController'),
  ...require('./student/profileController'),
  ...require('./student/academicPathController'),
  ...require('./student/skillController'),
  ...require('./student/settingsController'),
  ...require('./student/notificationController'),
  ...require('./student/githubImportController'),
  ...require('./student/recommendationController'),
};
