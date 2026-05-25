'use strict';

const express = require('express');

const authMiddleware = require('../middlewares/authMiddleware');
const checkRoles = require('../middlewares/checkRoles');
const workspaceController = require('../controllers/studentWorkspaceController');
const { uploadFields } = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.use(checkRoles('STUDENT'));

router.get('/me', workspaceController.listProjects);
router.post('/', workspaceController.createProject);
router.get('/:id', workspaceController.getProject);
router.put('/:id', workspaceController.updateProject);
router.patch('/:id/submit', workspaceController.submitProject);
router.delete('/:id', workspaceController.deleteProject);
router.post(
  '/:id/media',
  uploadFields([
    { name: 'screenshots', maxCount: 10 },
    { name: 'attachments', maxCount: 10 },
  ]),
  workspaceController.uploadProjectMedia
);
router.delete('/:id/media/:mediaId', workspaceController.deleteProjectMedia);

module.exports = router;
