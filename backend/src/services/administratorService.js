'use strict';

module.exports = {
  ...require('./administrator/dashboardService'),
  ...require('./administrator/profileService'),
  ...require('./administrator/userService'),
  ...require('./administrator/professionalRequestService'),
  ...require('./administrator/validationService'),
  ...require('./administrator/notificationAdminService'),
  ...require('./administrator/reportAdminService'),
  ...require('./administrator/badgeService'),
};
