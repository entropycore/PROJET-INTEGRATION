'use strict';

const studentCommentService = require('../../services/studentCommentService');
const { handleStudentError } = require('../studentHelpers');
const { success, error } = require('../../utils/apiResponse');

const handleCommentError = (res, err) => {
  if (err.message === 'COMMENT_NOT_FOUND') {
    return error(res, 404, 'Commentaire introuvable.');
  }

  return null;
};

exports.getComments = async (req, res, next) => {
  try {
    const comments = await studentCommentService.listStudentComments(
      req.user.userId,
      req.query,
    );

    return success(res, 200, 'Commentaires etudiants charges.', comments);
  } catch (err) {
    if (handleCommentError(res, err)) return;
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getCommentById = async (req, res, next) => {
  try {
    const comment = await studentCommentService.getStudentCommentById(
      req.user.userId,
      req.params.commentId,
    );

    return success(res, 200, 'Commentaire charge.', comment);
  } catch (err) {
    if (handleCommentError(res, err)) return;
    if (handleStudentError(res, err)) return;
    next(err);
  }
};
