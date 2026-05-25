'use strict';

const {
  workspaceService,
  fileService,
  success,
  error,
  wrap,
} = require('./shared');

exports.listValidators = wrap(async (_req, res) =>
  success(res, 200, 'Validateurs recuperes.', await workspaceService.listValidators())
);
