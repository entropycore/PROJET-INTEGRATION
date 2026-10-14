'use strict';

const express = require('express');
const dashboardController = require('../../controllers/student/dashboardController');

const router = express.Router();

router.get('/dashboard', dashboardController.getDashboard);
router.get('/credibility-score', dashboardController.getCredibilityScore);
router.get('/credibility-score/details', dashboardController.getCredibilityScoreDetails);
router.get('/profile-completion', dashboardController.getProfileCompletion);
router.get('/timeline', dashboardController.getTimeline);
router.get('/badges', dashboardController.getBadges);

module.exports = router;
