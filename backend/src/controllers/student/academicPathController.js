'use strict';

const academicPathService = require('../../services/student/academicPathService');
const { handleStudentError } = require('../studentHelpers');
const { success } = require('../../utils/apiResponse');

exports.listAcademicPaths = async (req, res, next) => {
  try {
    const academicPaths = await academicPathService.listAcademicPaths(req.user.userId);
    return success(res, 200, 'Parcours académiques chargés.', academicPaths);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.createAcademicPath = async (req, res, next) => {
  try {
    const academicPaths = await academicPathService.createAcademicPath(
      req.user.userId,
      req.body,
    );
    return success(res, 201, 'Parcours académique ajouté.', academicPaths);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.updateAcademicPath = async (req, res, next) => {
  try {
    const academicPaths = await academicPathService.updateAcademicPath(
      req.user.userId,
      req.params.academicPathId,
      req.body,
    );
    return success(res, 200, 'Parcours académique mis à jour.', academicPaths);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.deleteAcademicPath = async (req, res, next) => {
  try {
    const result = await academicPathService.deleteAcademicPath(
      req.user.userId,
      req.params.academicPathId,
    );
    return success(res, 200, 'Parcours académique supprimé.', result);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};
