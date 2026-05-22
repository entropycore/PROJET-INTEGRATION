'use strict';

const studentService = require('../services/studentService');
const { handleStudentError } = require('./studentHelpers');
const { success } = require('../utils/apiResponse');

exports.getDashboard = async (req, res, next) => {
  try {
    const dashboard = await studentService.getStudentDashboard(req.user.userId);
    return success(res, 200, 'Tableau de bord étudiant chargé.', dashboard);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const profile = await studentService.getStudentProfile(req.user.userId);
    return success(res, 200, 'Profil étudiant chargé.', profile);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getCredibilityScore = async (req, res, next) => {
  try {
    const credibility = await studentService.getStudentCredibilityScore(req.user.userId);
    return success(res, 200, 'Score de crédibilité chargé.', credibility);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getCredibilityScoreDetails = async (req, res, next) => {
  try {
    const details = await studentService.getStudentCredibilityScoreDetails(req.user.userId);
    return success(res, 200, 'Détails du score de crédibilité chargés.', details);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getProfileCompletion = async (req, res, next) => {
  try {
    const profileCompletion = await studentService.getStudentProfileCompletion(req.user.userId);
    return success(res, 200, 'Progression du profil chargée.', profileCompletion);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getTimeline = async (req, res, next) => {
  try {
    const timeline = await studentService.getStudentTimeline(req.user.userId);
    return success(res, 200, 'Timeline étudiante chargée.', timeline);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getBadges = async (req, res, next) => {
  try {
    const badges = await studentService.getStudentBadges(req.user.userId);
    return success(res, 200, 'Badges étudiants chargés.', badges);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getProfileCompat = async (req, res, next) => {
  try {
    const profile = await studentService.getStudentProfileCompat(req.user.userId);
    return success(res, 200, 'Profil étudiant chargé.', profile);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.updateProfileCompat = async (req, res, next) => {
  try {
    const profile = await studentService.updateStudentProfileCompat(req.user.userId, req.body);
    return success(res, 200, 'Profil étudiant mis à jour.', profile);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.listAcademicPaths = async (req, res, next) => {
  try {
    const academicPaths = await studentService.listAcademicPaths(req.user.userId);
    return success(res, 200, 'Parcours académiques chargés.', academicPaths);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.createAcademicPath = async (req, res, next) => {
  try {
    const academicPaths = await studentService.createAcademicPath(req.user.userId, req.body);
    return success(res, 201, 'Parcours académique ajouté.', academicPaths);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.updateAcademicPath = async (req, res, next) => {
  try {
    const academicPaths = await studentService.updateAcademicPath(req.user.userId, req.params.academicPathId, req.body);
    return success(res, 200, 'Parcours académique mis à jour.', academicPaths);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.deleteAcademicPath = async (req, res, next) => {
  try {
    const result = await studentService.deleteAcademicPath(req.user.userId, req.params.academicPathId);
    return success(res, 200, 'Parcours académique supprimé.', result);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getSoftSkills = async (req, res, next) => {
  try {
    const softSkills = await studentService.getStudentSoftSkills(req.user.userId);
    return success(res, 200, 'Compétences comportementales chargées.', softSkills);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.addSoftSkill = async (req, res, next) => {
  try {
    const softSkills = await studentService.addStudentSoftSkill(req.user.userId, req.body);
    return success(res, 201, 'Compétence comportementale ajoutée.', softSkills);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.deleteSoftSkill = async (req, res, next) => {
  try {
    const result = await studentService.deleteStudentSoftSkill(req.user.userId, req.params.studentSkillId);
    return success(res, 200, 'Compétence comportementale supprimée.', result);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getCareerGoal = async (req, res, next) => {
  try {
    const careerGoal = await studentService.getStudentCareerGoal(req.user.userId);
    return success(res, 200, 'Objectif professionnel chargé.', careerGoal);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.updateCareerGoal = async (req, res, next) => {
  try {
    const careerGoal = await studentService.updateStudentCareerGoal(req.user.userId, req.body);
    return success(res, 200, 'Objectif professionnel mis à jour.', careerGoal);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.updateSettingsPassword = async (req, res, next) => {
  try {
    const result = await studentService.updateStudentSettingsPassword(req.user.userId, req.body);
    return success(res, 200, 'Mot de passe étudiant mis à jour.', result);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.updateSettingsPrivacy = async (req, res, next) => {
  try {
    const settings = await studentService.updateStudentSettingsPrivacy(req.user.userId, req.body);
    return success(res, 200, 'Préférences de confidentialité mises à jour.', settings);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.updateSettingsNotifications = async (req, res, next) => {
  try {
    const settings = await studentService.updateStudentSettingsNotifications(req.user.userId, req.body);
    return success(res, 200, 'Préférences de notification mises à jour.', settings);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getSkills = async (req, res, next) => {
  try {
    const skills = await studentService.getStudentSkills(req.user.userId);
    return success(res, 200, 'Compétences étudiantes chargées.', skills);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.addSkill = async (req, res, next) => {
  try {
    const skills = await studentService.addStudentSkill(req.user.userId, req.body);
    return success(res, 201, 'Compétence ajoutée.', skills);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.deleteSkill = async (req, res, next) => {
  try {
    const result = await studentService.deleteStudentSkill(req.user.userId, req.params.studentSkillId);
    return success(res, 200, 'Compétence supprimée.', result);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.listSkillsCatalog = async (req, res, next) => {
  try {
    const skills = await studentService.listSkillsCatalog(req.query.search || '');
    return success(res, 200, 'Catalogue des compétences chargé.', skills);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getUnreadNotifications = async (req, res, next) => {
  try {
    const notifications = await studentService.getUnreadStudentNotifications(req.user.userId);
    return success(res, 200, 'Notifications non lues chargées.', notifications);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.listNotifications = async (req, res, next) => {
  try {
    const notifications = await studentService.listStudentNotifications(req.user.userId, req.query);
    return success(res, 200, 'Notifications étudiantes chargées.', notifications);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getUnreadNotificationsCount = async (req, res, next) => {
  try {
    const count = await studentService.getStudentUnreadNotificationCount(req.user.userId);
    return success(res, 200, 'Compteur de notifications chargé.', count);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.markNotificationAsRead = async (req, res, next) => {
  try {
    const notification = await studentService.markStudentNotificationAsRead(req.user.userId, req.params.notificationId);
    return success(res, 200, 'Notification marquée comme lue.', notification);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const result = await studentService.markAllStudentNotificationsAsRead(req.user.userId);
    return success(res, 200, 'Toutes les notifications ont été marquées comme lues.', result);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const result = await studentService.deleteStudentNotification(req.user.userId, req.params.notificationId);
    return success(res, 200, 'Notification supprimée.', result);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getGithubAuthLink = async (req, res, next) => {
  try {
    const authLink = await studentService.getStudentGithubAuthLink();
    return success(res, 200, 'Lien GitHub généré.', authLink);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getGithubStats = async (req, res, next) => {
  try {
    const stats = await studentService.getStudentGithubStats(req.user.userId);
    return success(res, 200, 'Statistiques GitHub chargées.', stats);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.importGithubRepository = async (req, res, next) => {
  try {
    const project = await studentService.importGithubRepository(req.user.userId, req.body);
    return success(res, 201, 'Dépôt GitHub importé dans les projets.', project);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};
