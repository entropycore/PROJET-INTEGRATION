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
router.get('/users', administratorController.listUsers);
router.get('/users/:userId', administratorController.getUser);
router.get('/professional-requests', administratorController.listProfessionalRequests);
router.get('/professional-requests/:userId', administratorController.getProfessionalRequest);
router.patch('/professional-requests/:userId/approve', administratorController.approveProfessionalRequest);
router.patch('/professional-requests/:userId/reject', administratorController.rejectProfessionalRequest);

module.exports = router;
