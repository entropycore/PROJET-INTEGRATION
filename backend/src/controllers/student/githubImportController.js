'use strict';

const studentGithubService = require('../../services/student/githubImportService');
const { handleStudentError } = require('../studentHelpers');
const { success } = require('../../utils/apiResponse');

exports.getGithubAuthLink = async (req, res, next) => {
  try {
    const authLink = await studentGithubService.getStudentGithubAuthLink();
    return success(res, 200, 'Lien GitHub généré.', authLink);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getGithubStats = async (req, res, next) => {
  try {
    const stats = await studentGithubService.getStudentGithubStats(req.user.userId);
    return success(res, 200, 'Statistiques GitHub chargées.', stats);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.importGithubRepository = async (req, res, next) => {
  try {
    const project = await studentGithubService.importGithubRepository(req.user.userId, req.body);
    return success(res, 201, 'Dépôt GitHub importé dans les projets.', project);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};
