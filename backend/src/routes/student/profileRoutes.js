'use strict';

const express = require('express');
const profileController = require('../../controllers/student/profileController');

const router = express.Router();

router.get('/profile', profileController.getProfile);
router.get('/career-goal', profileController.getCareerGoal);
router.put('/career-goal', profileController.updateCareerGoal);

module.exports = router;
