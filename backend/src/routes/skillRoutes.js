'use strict';

const express = require('express');

const authMiddleware = require('../middlewares/authMiddleware');
const workspaceController = require('../controllers/studentWorkspaceController');

const router = express.Router();

router.use(authMiddleware);

router.get('/', workspaceController.listSkillsCatalog);

module.exports = router;
