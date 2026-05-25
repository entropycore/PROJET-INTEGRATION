'use strict';

module.exports = {
  ...require('./administrator/dashboardController'),
  ...require('./administrator/validationController'),
  ...require('./administrator/notificationController'),
  ...require('./administrator/reportController'),
  ...require('./administrator/profileController'),
  ...require('./administrator/userController'),
  ...require('./administrator/professionalRequestController'),
  ...require('./administrator/badgeController'),
};
