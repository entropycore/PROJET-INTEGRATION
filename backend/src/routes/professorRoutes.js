'use strict';

const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRoles = require('../middlewares/checkRoles');
const professorController = require('../controllers/professorController');

const router = express.Router();

router.use(authMiddleware);
router.use(checkRoles('PROFESSOR'));

router.get('/dashboard', professorController.getDashboard);
router.get('/profile', professorController.getProfile);

module.exports = router;
