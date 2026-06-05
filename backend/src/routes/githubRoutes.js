const express = require('express');
const router = express.Router();
const githubController = require('../controllers/githubController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/auth', authMiddleware, githubController.auth);
router.get('/callback', githubController.callback);
router.get('/stats', authMiddleware, githubController.getStats);
router.post('/import', authMiddleware, githubController.importProject);

module.exports = router;