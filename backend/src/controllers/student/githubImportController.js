'use strict';

const studentGithubService = require('../../services/student/githubImportService');
const { handleStudentError } = require('../studentHelpers');
const { success } = require('../../utils/apiResponse');

exports.getGithubAuthLink = async (req, res, next) => {
  try {
    const authLink = await studentGithubService.getStudentGithubAuthLink(req.user.userId);
    return success(res, 200, 'Lien GitHub genere.', authLink);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.handleGithubCallback = async (req, res) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  try {
    await studentGithubService.handleGithubCallback(req.query);
    return res.redirect(`${clientUrl}/student/github?status=success`);
  } catch {
    return res.redirect(`${clientUrl}/student/github?status=error`);
  }
};

exports.getGithubStats = async (req, res, next) => {
  try {
    const stats = await studentGithubService.getStudentGithubStats(req.user.userId);
    return success(res, 200, 'Statistiques GitHub chargees.', stats);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.importGithubRepository = async (req, res, next) => {
  try {
    const project = await studentGithubService.importGithubRepository(req.user.userId, req.body);
    return success(res, 201, 'Depot GitHub importe dans les projets.', project);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};
