'use strict';

const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRoles = require('../middlewares/checkRoles');
const professionalController = require('../controllers/professionalController');

const router = express.Router();

router.use(authMiddleware);
router.use(checkRoles('PROFESSIONAL'));

router.get('/dashboard', professionalController.getDashboard);
router.get('/profile', professionalController.getProfile);

module.exports = router;
