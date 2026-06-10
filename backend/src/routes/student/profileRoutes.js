'use strict';

const express = require('express');
const profileController = require('../../controllers/student/profileController');
const uploadProfilePicture = require('../../middlewares/uploadProfilePicture');
const { updateCareerGoalRules, handleValidationErrors } = require('../../middlewares/validationRules');

const router = express.Router();

router.get('/profile', profileController.getProfile);
router.post('/profile-picture', uploadProfilePicture, profileController.uploadProfilePicture);
router.get('/career-goal', profileController.getCareerGoal);
router.put('/career-goal', updateCareerGoalRules, handleValidationErrors, profileController.updateCareerGoal);

module.exports = router;
