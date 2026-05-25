'use strict';

const express = require('express');

const authMiddleware = require('../middlewares/authMiddleware');
const checkRoles = require('../middlewares/checkRoles');
const workspaceController = require('../controllers/studentWorkspaceController');

const router = express.Router();

router.use(authMiddleware);
router.use(checkRoles('STUDENT'));

router.get('/me', workspaceController.getStudentMe);
router.put('/me', workspaceController.updateStudentMe);
router.get('/me/skills', workspaceController.listStudentSkills);
router.post('/me/skills', workspaceController.addStudentSkill);
router.delete('/me/skills/:id', workspaceController.deleteStudentSkill);
router.get('/me/skills/stats', workspaceController.getSkillStats);

module.exports = router;
