'use strict';

const express = require('express');
const dashboardController = require('../../controllers/administrator/dashboardController');

const router = express.Router();

router.get('/dashboard', dashboardController.getDashboard);
router.get('/dashboard-items/:itemType/:itemId', dashboardController.getDashboardItemDetail);
router.patch('/dashboard-items/:itemType/:itemId/approve', dashboardController.approveDashboardItem);
router.patch('/dashboard-items/:itemType/:itemId/reject', dashboardController.rejectDashboardItem);

module.exports = router;
