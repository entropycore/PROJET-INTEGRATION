'use strict';

const workspaceService = require('../../services/studentWorkspaceService');
const fileService = require('../../services/fileService');
const { success, error } = require('../../utils/apiResponse');

const handleWorkspaceError = (res, err) => {
  if (!err.status) return false;
  return res.status(err.status).json({
    success: false,
    message: err.message,
    error: { code: err.message },
    errors: { code: err.message },
  });
};

const wrap = (handler) => async (req, res, next) => {
  try {
    return await handler(req, res, next);
  } catch (err) {
    if (handleWorkspaceError(res, err)) return null;
    return next(err);
  }
};

module.exports = {
  workspaceService,
  fileService,
  success,
  error,
  wrap,
};
