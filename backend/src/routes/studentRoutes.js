'use strict';

const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRoles = require('../middlewares/checkRoles');
const githubImportController = require('../controllers/student/githubImportController');
const activityRoutes = require('./student/activityRoutes');
const commentRoutes = require('./student/commentRoutes');
const dashboardRoutes = require('./student/dashboardRoutes');
const githubImportRoutes = require('./student/githubImportRoutes');
const notificationRoutes = require('./student/notificationRoutes');
const portfolioRoutes = require('./student/portfolioRoutes');
const profileRoutes = require('./student/profileRoutes');
const recommendationLetterRoutes = require('./student/recommendationLetterRoutes');
const recommendationRoutes = require('./student/recommendationRoutes');
const settingsRoutes = require('./student/settingsRoutes');
const skillRoutes = require('./student/skillRoutes');
const stageRoutes = require('./student/stageRoutes');
const validatorRoutes = require('./student/validatorRoutes');

const router = express.Router();

router.get('/github/callback', githubImportController.handleGithubCallback);

router.use(authMiddleware);
router.use(checkRoles('STUDENT'));

router.use(dashboardRoutes);
router.use(profileRoutes);
router.use(portfolioRoutes);
router.use(recommendationRoutes);
router.use(recommendationLetterRoutes);
router.use(commentRoutes);
router.use(activityRoutes);
router.use(skillRoutes);
router.use('/settings', settingsRoutes);
router.use(notificationRoutes);
router.use(githubImportRoutes);
router.use(stageRoutes);
router.use(validatorRoutes);

module.exports = router;
