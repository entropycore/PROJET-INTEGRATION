'use strict';

const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRoles = require('../middlewares/checkRoles');
const uploadCsv = require('../middlewares/uploadCsv');
const administratorController = require('../controllers/administratorController');
const badgeRoutes = require('./administrator/badgeRoutes');
const dashboardRoutes = require('./administrator/dashboardRoutes');
const notificationRoutes = require('./administrator/notificationRoutes');
const professionalRequestRoutes = require('./administrator/professionalRequestRoutes');
const reportRoutes = require('./administrator/reportRoutes');
const userRoutes = require('./administrator/userRoutes');
const validationRoutes = require('./administrator/validationRoutes');

const router = express.Router();

router.use(authMiddleware);
router.use(checkRoles('ADMINISTRATOR'));

router.post('/users/import-csv', uploadCsv.single('file'), administratorController.importUsersCsv);

router.use(dashboardRoutes);
router.use(notificationRoutes);
router.use(validationRoutes);
router.use(reportRoutes);
router.use(badgeRoutes);
router.use(userRoutes);
router.use(professionalRequestRoutes);

module.exports = router;