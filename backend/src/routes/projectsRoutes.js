'use strict';

const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRoles = require('../middlewares/checkRoles');
const uploadProjectMedia = require('../middlewares/uploadProjectMedia');
const studentProjectController = require('../controllers/studentProjectController');
const {
  createProjectRules,
  updateProjectRules,
  handleValidationErrors,
} = require('../middlewares/validationRules');

const router = express.Router();

router.use(authMiddleware);

router.get(
  '/:projectId/media/:mediaId/content',
  checkRoles('STUDENT', 'PROFESSOR', 'ADMINISTRATOR'),
  studentProjectController.getProjectMediaContent,
);
router.get(
  '/:projectId/media/:mediaId/download',
  checkRoles('STUDENT', 'PROFESSOR', 'ADMINISTRATOR'),
  studentProjectController.downloadProjectMedia,
);

router.use(checkRoles('STUDENT'));
router.get('/me', studentProjectController.listProjects);
router.get('/:projectId', studentProjectController.getProjectById);
router.post('/', createProjectRules, handleValidationErrors, studentProjectController.createProject);
router.put('/:projectId', updateProjectRules, handleValidationErrors, studentProjectController.updateProject);
router.patch('/:projectId/submit', studentProjectController.submitProject);
router.post('/:projectId/media', uploadProjectMedia, studentProjectController.uploadProjectMedia);
router.delete('/:projectId/media/:mediaId', studentProjectController.deleteProjectMedia);
router.delete('/:projectId', studentProjectController.deleteProject);

module.exports = router;
