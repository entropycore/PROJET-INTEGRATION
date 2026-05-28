'use strict';

const express = require('express');
const githubImportController = require('../../controllers/student/githubImportController');

const router = express.Router();

router.get('/github/auth', githubImportController.getGithubAuthLink);
router.get('/github/stats', githubImportController.getGithubStats);
router.post('/github/import', githubImportController.importGithubRepository);

module.exports = router;
