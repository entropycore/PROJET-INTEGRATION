'use strict';

const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRoles = require('../middlewares/checkRoles');
const studentController = require('../controllers/studentController');
const uploadAttestation = require('../middlewares/uploadAttestation');


const router = express.Router();

router.use(authMiddleware);
router.use(checkRoles('STUDENT'));

router.get('/dashboard', studentController.getDashboard);
router.get('/profile', studentController.getProfile);
router.get('/activities', studentController.getActivities);
router.post('/activities', uploadAttestation.single('attestation'), studentController.createActivity);
router.get('/skills', studentController.getSkillsByCategory);



module.exports = router;
