'use strict';

const studentService = require('../services/studentService');
const { success, error } = require('../utils/apiResponse');

const handleStudentError = (res, err) => {
  if (err.message === 'STUDENT_PROFILE_NOT_FOUND') {
    return error(res, 404, 'Profil etudiant introuvable.');
  }

  if (err.message === 'ACADEMIC_PATH_NOT_FOUND') {
    return error(res, 404, 'Parcours academique introuvable.');
  }

  if (err.message === 'SOFT_SKILL_NOT_FOUND') {
    return error(res, 404, 'Competence comportementale introuvable.');
  }

  if (err.message === 'SOFT_SKILL_NAME_REQUIRED') {
    return error(res, 400, 'Le nom de la competence comportementale est requis.');
  }

  if (err.message === 'SKILL_NOT_FOUND') {
    return error(res, 404, 'Competence introuvable.');
  }

  if (err.message === 'STUDENT_SKILL_NOT_FOUND') {
    return error(res, 404, 'Competence etudiante introuvable.');
  }

  if (err.message === 'STUDENT_NOTIFICATION_NOT_FOUND') {
    return error(res, 404, 'Notification etudiante introuvable.');
  }

  if (err.message === 'GITHUB_NOT_CONFIGURED') {
    return error(res, 503, 'Integration GitHub non configuree.');
  }

  if (err.message === 'GITHUB_REPOSITORY_NAME_REQUIRED') {
    return error(res, 400, 'Le nom du depot GitHub est requis.');
  }

  return null;
};

exports.getDashboard = async (req, res, next) => {
  try {
    const dashboard = await studentService.getStudentDashboard(req.user.userId);
    return success(res, 200, 'Tableau de bord etudiant charge.', dashboard);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const profile = await studentService.getStudentProfile(req.user.userId);
    return success(res, 200, 'Profil etudiant charge.', profile);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getCredibilityScore = async (req, res, next) => {
  try {
    const credibility = await studentService.getStudentCredibilityScore(req.user.userId);
    return success(res, 200, 'Score de credibilite charge.', credibility);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getCredibilityScoreDetails = async (req, res, next) => {
  try {
    const details = await studentService.getStudentCredibilityScoreDetails(req.user.userId);
    return success(res, 200, 'Details du score de credibilite charges.', details);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getProfileCompletion = async (req, res, next) => {
  try {
    const profileCompletion = await studentService.getStudentProfileCompletion(req.user.userId);
    return success(res, 200, 'Progression du profil chargee.', profileCompletion);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getTimeline = async (req, res, next) => {
  try {
    const timeline = await studentService.getStudentTimeline(req.user.userId);
    return success(res, 200, 'Timeline etudiante chargee.', timeline);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getBadges = async (req, res, next) => {
  try {
    const badges = await studentService.getStudentBadges(req.user.userId);
    return success(res, 200, 'Badges etudiants charges.', badges);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getProfileCompat = async (req, res, next) => {
  try {
    const profile = await studentService.getStudentProfileCompat(req.user.userId);
    return success(res, 200, 'Profil etudiant charge.', profile);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.updateProfileCompat = async (req, res, next) => {
  try {
    const profile = await studentService.updateStudentProfileCompat(req.user.userId, req.body);
    return success(res, 200, 'Profil etudiant mis a jour.', profile);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.listAcademicPaths = async (req, res, next) => {
  try {
    const academicPaths = await studentService.listAcademicPaths(req.user.userId);
    return success(res, 200, 'Parcours academiques charges.', academicPaths);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.createAcademicPath = async (req, res, next) => {
  try {
    const academicPaths = await studentService.createAcademicPath(req.user.userId, req.body);
    return success(res, 201, 'Parcours academique ajoute.', academicPaths);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.updateAcademicPath = async (req, res, next) => {
  try {
    const academicPaths = await studentService.updateAcademicPath(
      req.user.userId,
      req.params.academicPathId,
      req.body,
    );
    return success(res, 200, 'Parcours academique mis a jour.', academicPaths);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.deleteAcademicPath = async (req, res, next) => {
  try {
    const result = await studentService.deleteAcademicPath(
      req.user.userId,
      req.params.academicPathId,
    );
    return success(res, 200, 'Parcours academique supprime.', result);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getSoftSkills = async (req, res, next) => {
  try {
    const softSkills = await studentService.getStudentSoftSkills(req.user.userId);
    return success(res, 200, 'Competences comportementales chargees.', softSkills);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.addSoftSkill = async (req, res, next) => {
  try {
    const softSkills = await studentService.addStudentSoftSkill(req.user.userId, req.body);
    return success(res, 201, 'Competence comportementale ajoutee.', softSkills);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.deleteSoftSkill = async (req, res, next) => {
  try {
    const result = await studentService.deleteStudentSoftSkill(
      req.user.userId,
      req.params.studentSkillId,
    );
    return success(res, 200, 'Competence comportementale supprimee.', result);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getCareerGoal = async (req, res, next) => {
  try {
    const careerGoal = await studentService.getStudentCareerGoal(req.user.userId);
    return success(res, 200, 'Objectif professionnel charge.', careerGoal);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.updateCareerGoal = async (req, res, next) => {
  try {
    const careerGoal = await studentService.updateStudentCareerGoal(req.user.userId, req.body);
    return success(res, 200, 'Objectif professionnel mis a jour.', careerGoal);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getSkills = async (req, res, next) => {
  try {
    const skills = await studentService.getStudentSkills(req.user.userId);
    return success(res, 200, 'Competences etudiantes chargees.', skills);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.addSkill = async (req, res, next) => {
  try {
    const skills = await studentService.addStudentSkill(req.user.userId, req.body);
    return success(res, 201, 'Competence ajoutee.', skills);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.deleteSkill = async (req, res, next) => {
  try {
    const result = await studentService.deleteStudentSkill(req.user.userId, req.params.studentSkillId);
    return success(res, 200, 'Competence supprimee.', result);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.listSkillsCatalog = async (req, res, next) => {
  try {
    const skills = await studentService.listSkillsCatalog(req.query.search || '');
    return success(res, 200, 'Catalogue des competences charge.', skills);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getUnreadNotifications = async (req, res, next) => {
  try {
    const notifications = await studentService.getUnreadStudentNotifications(req.user.userId);
    return success(res, 200, 'Notifications non lues chargees.', notifications);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.listNotifications = async (req, res, next) => {
  try {
    const notifications = await studentService.listStudentNotifications(req.user.userId, req.query);
    return success(res, 200, 'Notifications etudiantes chargees.', notifications);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getUnreadNotificationsCount = async (req, res, next) => {
  try {
    const count = await studentService.getStudentUnreadNotificationCount(req.user.userId);
    return success(res, 200, 'Compteur de notifications charge.', count);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.markNotificationAsRead = async (req, res, next) => {
  try {
    const notification = await studentService.markStudentNotificationAsRead(
      req.user.userId,
      req.params.notificationId,
    );
    return success(res, 200, 'Notification marquee comme lue.', notification);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const result = await studentService.markAllStudentNotificationsAsRead(req.user.userId);
    return success(res, 200, 'Toutes les notifications ont ete marquees comme lues.', result);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const result = await studentService.deleteStudentNotification(
      req.user.userId,
      req.params.notificationId,
    );
    return success(res, 200, 'Notification supprimee.', result);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getGithubAuthLink = async (req, res, next) => {
  try {
    const authLink = await studentService.getStudentGithubAuthLink();
    return success(res, 200, 'Lien GitHub genere.', authLink);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getGithubStats = async (req, res, next) => {
  try {
    const stats = await studentService.getStudentGithubStats(req.user.userId);
    return success(res, 200, 'Statistiques GitHub chargees.', stats);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.importGithubRepository = async (req, res, next) => {
  try {
    const project = await studentService.importGithubRepository(req.user.userId, req.body);
    return success(res, 201, 'Depot GitHub importe dans les projets.', project);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};
