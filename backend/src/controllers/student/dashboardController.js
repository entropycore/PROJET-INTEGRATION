'use strict';

const studentDashboardService = require('../../services/student/dashboardService');
const { handleStudentError } = require('../studentHelpers');
const { success } = require('../../utils/apiResponse');

exports.getDashboard = async (req, res, next) => {
  try {
    const dashboard = await studentDashboardService.getStudentDashboard(req.user.userId);
    return success(res, 200, 'Tableau de bord étudiant chargé.', dashboard);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getCredibilityScore = async (req, res, next) => {
  try {
    const credibility = await studentDashboardService.getStudentCredibilityScore(req.user.userId);
    return success(res, 200, 'Score de crédibilité chargé.', credibility);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getCredibilityScoreDetails = async (req, res, next) => {
  try {
    const details = await studentDashboardService.getStudentCredibilityScoreDetails(
      req.user.userId,
    );
    return success(res, 200, 'Détails du score de crédibilité chargés.', details);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getProfileCompletion = async (req, res, next) => {
  try {
    const profileCompletion = await studentDashboardService.getStudentProfileCompletion(
      req.user.userId,
    );
    return success(res, 200, 'Progression du profil chargée.', profileCompletion);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getTimeline = async (req, res, next) => {
  try {
    const timeline = await studentDashboardService.getStudentTimeline(req.user.userId);
    return success(res, 200, 'Timeline étudiante chargée.', timeline);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getBadges = async (req, res, next) => {
  try {
    const badges = await studentDashboardService.getStudentBadges(req.user.userId);
    return success(res, 200, 'Badges étudiants chargés.', badges);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};
