'use strict';

const express = require('express');
const reportController = require('../../controllers/administrator/reportController');

const router = express.Router();

router.get('/reports', reportController.listReports);
router.get('/reports/pending-count', reportController.getPendingReportsCountLegacy);
router.get('/reports/:reportId', reportController.getReportById);
router.patch('/reports/:reportId/resolve', reportController.resolveLegacyReport);
router.patch('/reports/:reportId/approve', reportController.approveReport);
router.patch('/reports/:reportId/reject', reportController.rejectReport);
router.delete('/reports/:reportId/target', reportController.deleteLegacyReportedTarget);

module.exports = router;
