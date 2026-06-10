'use strict';

const express = require('express');
const skillController = require('../../controllers/student/skillController');
const { addSoftSkillRules, handleValidationErrors } = require('../../middlewares/validationRules');

const router = express.Router();

router.get('/skills/stats', skillController.getSkillStats);
router.get('/soft-skills', skillController.getSoftSkills);
router.post('/soft-skills', addSoftSkillRules, handleValidationErrors, skillController.addSoftSkill);
router.delete('/soft-skills/:studentSkillId', skillController.deleteSoftSkill);

module.exports = router;
