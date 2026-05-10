'use strict';

const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRoles = require('../middlewares/checkRoles');
const administratorController = require('../controllers/administratorController');

const router = express.Router();

router.use(authMiddleware);
router.use(checkRoles('ADMINISTRATOR'));

router.get('/dashboard', administratorController.getDashboard);
router.get('/dashboard-items/:itemType/:itemId', administratorController.getDashboardItemDetail);
router.patch('/dashboard-items/:itemType/:itemId/approve', administratorController.approveDashboardItem);
router.patch('/dashboard-items/:itemType/:itemId/reject', administratorController.rejectDashboardItem);
router.get('/notifications', administratorController.listNotifications);
router.patch('/notifications/read-all', administratorController.markAllNotificationsAsRead);
router.patch('/notifications/:notificationId/read', administratorController.markNotificationAsRead);
router.get('/validations/pending', administratorController.listPendingValidationsLegacy);
router.get('/validations/pending-count', administratorController.getPendingValidationCountsLegacy);
router.get('/validations/:validationId', administratorController.getLegacyValidationDetail);
router.patch('/validations/:validationId/approve', administratorController.approveLegacyValidationItem);
router.patch('/validations/:validationId/reject', administratorController.rejectLegacyValidationItem);
router.patch(
  '/validations/:validationId/request-changes',
  administratorController.requestLegacyValidationChanges
);
router.get('/validations', administratorController.listValidationItems);
router.get('/validations/:itemType/:itemId', administratorController.getValidationItemDetail);
router.patch('/validations/:itemType/:itemId/approve', administratorController.approveValidationItem);
router.patch('/validations/:itemType/:itemId/reject', administratorController.rejectValidationItem);
router.get('/reports', administratorController.listReports);
router.get('/reports/:reportId', administratorController.getReportById);
router.patch('/reports/:reportId/approve', administratorController.approveReport);
router.patch('/reports/:reportId/reject', administratorController.rejectReport);
router.get('/profile', administratorController.getProfile);
router.get('/users', administratorController.listUsers);
router.post('/users', administratorController.createUser);
router.get('/users/:userId', administratorController.getUserById);
router.put('/users/:userId', administratorController.updateUser);
router.patch('/users/:userId/status', administratorController.updateUserStatus);
router.patch('/users/:userId/role', administratorController.updateUserRole);
router.patch('/users/:userId/reset-password', administratorController.resetUserPassword);
router.delete('/users/:userId', administratorController.deleteUser);
router.get('/professional-requests', administratorController.listProfessionalRequests);
router.get('/professional-requests/:userId', administratorController.getProfessionalRequest);
router.patch('/professional-requests/:userId/approve', administratorController.approveProfessionalRequest);
router.patch('/professional-requests/:userId/reject', administratorController.rejectProfessionalRequest);

module.exports = router;
