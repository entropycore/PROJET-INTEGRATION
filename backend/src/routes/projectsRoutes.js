'use strict';

const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRoles = require('../middlewares/checkRoles');
const studentProjectController = require('../controllers/studentProjectController');

const router = express.Router();

router.use(authMiddleware);
router.use(checkRoles('STUDENT'));

router.get('/me', studentProjectController.listProjects);
router.get('/:projectId', studentProjectController.getProjectById);
router.post('/', studentProjectController.createProject);
router.put('/:projectId', studentProjectController.updateProject);
router.patch('/:projectId/submit', studentProjectController.submitProject);
router.delete('/:projectId', studentProjectController.deleteProject);

module.exports = router;
