'use strict';

const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRoles = require('../middlewares/checkRoles');
const profileController = require('../controllers/student/profileController');
const skillController = require('../controllers/student/skillController');
const { updateProfileRules, handleValidationErrors } = require('../middlewares/validationRules');

const router = express.Router();

router.use(authMiddleware);
router.use(checkRoles('STUDENT'));

router.get('/me', profileController.getProfileCompat);
router.put('/me', updateProfileRules, handleValidationErrors, profileController.updateProfileCompat);
router.get('/me/skills/stats', skillController.getSkillStats);
router.get('/me/skills', skillController.getSkills);
router.post('/me/skills', skillController.addSkill);
router.delete('/me/skills/:studentSkillId', skillController.deleteSkill);

module.exports = router;
