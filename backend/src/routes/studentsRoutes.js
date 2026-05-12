'use strict';

const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRoles = require('../middlewares/checkRoles');
const studentController = require('../controllers/studentController');

const router = express.Router();

router.use(authMiddleware);
router.use(checkRoles('STUDENT'));

router.get('/me', studentController.getProfileCompat);
router.put('/me', studentController.updateProfileCompat);
router.get('/me/skills', studentController.getSkills);
router.post('/me/skills', studentController.addSkill);
router.delete('/me/skills/:studentSkillId', studentController.deleteSkill);

module.exports = router;
