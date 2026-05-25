'use strict';

const express = require('express');

const authMiddleware = require('../middlewares/authMiddleware');
const checkRoles = require('../middlewares/checkRoles');
const workspaceController = require('../controllers/studentWorkspaceController');

const router = express.Router();

router.use(authMiddleware);
router.use(checkRoles('STUDENT'));

router.get('/me', workspaceController.listAcademicPaths);
router.post('/', workspaceController.createAcademicPath);
router.put('/:id', workspaceController.updateAcademicPath);
router.delete('/:id', workspaceController.deleteAcademicPath);

module.exports = router;
