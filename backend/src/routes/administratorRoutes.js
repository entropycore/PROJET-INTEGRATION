'use strict';

const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRoles = require('../middlewares/checkRoles');
const administratorController = require('../controllers/administratorController');

const router = express.Router();

router.use(authMiddleware);
router.use(checkRoles('ADMINISTRATOR'));

router.get('/dashboard', administratorController.getDashboard);
router.get('/profile', administratorController.getProfile);

module.exports = router;
