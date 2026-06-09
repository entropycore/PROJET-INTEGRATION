'use strict';

const commentService = require('../../services/student/commentService');
const { success } = require('../../utils/apiResponse');

exports.listComments = async (req, res, next) => {
  try {
    const comments = await commentService.listStudentComments(req.user.userId);
    return success(res, 200, 'Commentaires charges.', comments);
  } catch (err) {
    next(err);
  }
};
