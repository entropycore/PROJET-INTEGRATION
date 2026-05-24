'use strict';

module.exports = {
  ...require('./administrator/dashboardService'),
  ...require('./administrator/profileService'),
  ...require('./administrator/badgeService'),
  ...require('./administrator/userService'),
  ...require('./administrator/professionalRequestService'),
  ...require('./administrator/validationService'),
  ...require('./administrator/adminNotificationService'),
  ...require('./administrator/reportService'),
};
