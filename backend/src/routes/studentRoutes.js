'use strict';

const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRoles = require('../middlewares/checkRoles');
const studentController = require('../controllers/studentController');

const router = express.Router();

router.use(authMiddleware);
router.use(checkRoles('STUDENT'));

router.get('/dashboard', studentController.getDashboard);
router.get('/profile', studentController.getProfile);


// Mettre à jour le profil de l'étudiant connecté
router.put('/profile', studentController.updateProfile);


module.exports = router;

