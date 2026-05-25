'use strict';

const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRoles = require('../middlewares/checkRoles');
const studentController = require('../controllers/studentController');
const workspaceController = require('../controllers/studentWorkspaceController');
const {
  uploadMultipleFiles,
  uploadSingleFile,
} = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.use(checkRoles('STUDENT'));

router.get('/dashboard', studentController.getDashboard);
router.get('/profile', studentController.getProfile);
router.get('/validators', workspaceController.listValidators);

router.get('/credibility-score', workspaceController.getCredibilityScore);
router.get('/credibility-score/details', workspaceController.getCredibilityScore);
router.get('/profile-completion', workspaceController.getProfileCompletion);
router.get('/timeline', workspaceController.getTimeline);
router.get('/badges', workspaceController.listBadges);

router.get('/stages', workspaceController.listStages);
router.post('/stages', workspaceController.createStage);
router.get('/stages/:id', workspaceController.getStage);
router.put('/stages/:id', workspaceController.updateStage);
router.delete('/stages/:id', workspaceController.deleteStage);
router.post('/stages/:id/submit-validation', workspaceController.submitStage);
router.patch('/stages/:id/visibility', workspaceController.updateStageVisibility);
router.post('/stages/:id/report', uploadSingleFile('report'), workspaceController.uploadStageReport);
router.get('/stages/:id/report/download', workspaceController.downloadStageReport);
router.post('/stages/:id/images', uploadMultipleFiles('images', 10), workspaceController.uploadStageImages);
router.get('/stages/:id/images/:mediaId/content', workspaceController.getStageImageContent);
router.delete('/stages/:id/images/:mediaId', workspaceController.deleteStageImage);
router.get('/stages/:id/validation-history', workspaceController.getStageValidationHistory);
router.post('/stages/:id/technologies', workspaceController.addStageTechnologies);
router.delete('/stages/:id/technologies/:technologyId', workspaceController.removeStageTechnology);

router.get('/activities', workspaceController.listActivities);
router.post('/activities', workspaceController.createActivity);
router.get('/activities/:id', workspaceController.getActivity);
router.put('/activities/:id', workspaceController.updateActivity);
router.delete('/activities/:id', workspaceController.deleteActivity);
router.post('/activities/:id/submit-validation', workspaceController.submitActivity);
router.post('/activities/:id/certificate', uploadSingleFile('certificate'), workspaceController.uploadActivityCertificate);
router.get('/activities/:id/certificate/download', workspaceController.downloadActivityCertificate);

router.get('/portfolio/preview', workspaceController.getPortfolioPreview);
router.post('/portfolio/generate', workspaceController.generatePortfolio);

router.get('/soft-skills', workspaceController.listSoftSkills);
router.post('/soft-skills', workspaceController.addSoftSkill);
router.delete('/soft-skills/:id', workspaceController.deleteStudentSkill);
router.get('/career-goal', workspaceController.getCareerGoal);
router.put('/career-goal', workspaceController.updateCareerGoal);

module.exports = router;
