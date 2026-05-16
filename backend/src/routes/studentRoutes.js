'use strict';

const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRoles = require('../middlewares/checkRoles');
const studentController = require('../controllers/studentController');
const studentStageController = require('../controllers/studentStageController');

const router = express.Router();

router.use(authMiddleware);
router.use(checkRoles('STUDENT'));

router.get('/dashboard', studentController.getDashboard);
router.get('/credibility-score', studentController.getCredibilityScore);
router.get('/credibility-score/details', studentController.getCredibilityScoreDetails);
router.get('/profile-completion', studentController.getProfileCompletion);
router.get('/timeline', studentController.getTimeline);
router.get('/badges', studentController.getBadges);
router.get('/soft-skills', studentController.getSoftSkills);
router.post('/soft-skills', studentController.addSoftSkill);
router.delete('/soft-skills/:studentSkillId', studentController.deleteSoftSkill);
router.get('/career-goal', studentController.getCareerGoal);
router.put('/career-goal', studentController.updateCareerGoal);
router.put('/settings/password', studentController.updateSettingsPassword);
router.put('/settings/privacy', studentController.updateSettingsPrivacy);
router.put('/settings/notifications', studentController.updateSettingsNotifications);
router.get('/notifications', studentController.listNotifications);
router.get('/notifications/unread-count', studentController.getUnreadNotificationsCount);
router.patch('/notifications/read-all', studentController.markAllNotificationsAsRead);
router.patch('/notifications/:notificationId/read', studentController.markNotificationAsRead);
router.delete('/notifications/:notificationId', studentController.deleteNotification);
router.get('/github/auth', studentController.getGithubAuthLink);
router.get('/github/stats', studentController.getGithubStats);
router.post('/github/import', studentController.importGithubRepository);
router.get('/stages', studentStageController.listStages);
router.get('/stages/:stageId', studentStageController.getStageById);
router.post('/stages', studentStageController.createStage);
router.put('/stages/:stageId', studentStageController.updateStage);
router.delete('/stages/:stageId', studentStageController.deleteStage);
router.post('/stages/:stageId/submit-validation', studentStageController.submitStageValidation);
router.patch('/stages/:stageId/visibility', studentStageController.updateStageVisibility);
router.post('/stages/:stageId/report', studentStageController.updateStageReport);
router.get('/stages/:stageId/validation-history', studentStageController.getStageValidationHistory);
router.post('/stages/:stageId/technologies', studentStageController.addStageTechnologies);
router.delete(
  '/stages/:stageId/technologies/:technologyId',
  studentStageController.removeStageTechnology,
);
router.get('/profile', studentController.getProfile);

module.exports = router;
