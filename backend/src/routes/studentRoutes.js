'use strict';

const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRoles = require('../middlewares/checkRoles');
const studentController = require('../controllers/studentController');

const router = express.Router();

router.use(authMiddleware);
router.use(checkRoles('STUDENT'));

router.get('/dashboard', studentController.getDashboard);
router.get('/credibility-score', studentController.getCredibilityScore);
router.get('/credibility-score/details', studentController.getCredibilityScoreDetails);
router.get('/profile-completion', studentController.getProfileCompletion);
router.get('/timeline', studentController.getTimeline);
router.get('/badges', studentController.getBadges);
router.get('/profile', studentController.getProfile);

module.exports = router;
