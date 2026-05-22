'use strict';

const express = require('express');
const skillController = require('../../controllers/student/skillController');

const router = express.Router();

router.get('/soft-skills', skillController.getSoftSkills);
router.post('/soft-skills', skillController.addSoftSkill);
router.delete('/soft-skills/:studentSkillId', skillController.deleteSoftSkill);

module.exports = router;
