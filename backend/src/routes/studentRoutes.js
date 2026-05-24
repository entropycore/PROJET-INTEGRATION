'use strict';

const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRoles = require('../middlewares/checkRoles');
const activityRoutes = require('./student/activityRoutes');
const dashboardRoutes = require('./student/dashboardRoutes');
const githubImportRoutes = require('./student/githubImportRoutes');
const notificationRoutes = require('./student/notificationRoutes');
const profileRoutes = require('./student/profileRoutes');
const recommendationRoutes = require('./student/recommendationRoutes');
const settingsRoutes = require('./student/settingsRoutes');
const skillRoutes = require('./student/skillRoutes');
const stageRoutes = require('./student/stageRoutes');
const validatorRoutes = require('./student/validatorRoutes');

const router = express.Router();

router.use(authMiddleware);
router.use(checkRoles('STUDENT'));

router.use(dashboardRoutes);
router.use(profileRoutes);
router.use(recommendationRoutes);
router.use(activityRoutes);
router.use(skillRoutes);
router.use(settingsRoutes);
router.use(notificationRoutes);
router.use(githubImportRoutes);
router.use(stageRoutes);
router.use(validatorRoutes);

module.exports = router;
