'use strict';

const express = require('express');

const workspaceController = require('../controllers/studentWorkspaceController');

const router = express.Router();

router.get('/:slug', workspaceController.getPublicPortfolio);

module.exports = router;
