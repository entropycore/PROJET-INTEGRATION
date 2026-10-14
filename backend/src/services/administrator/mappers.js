'use strict';

module.exports = {
  ...require('./mappers/userMappers'),
  ...require('./mappers/validationMappers'),
  ...require('./mappers/reportMappers'),
  ...require('./mappers/notificationMappers'),
};
