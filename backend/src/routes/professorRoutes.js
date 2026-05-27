'use strict';

const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRoles = require('../middlewares/checkRoles');
const professorController = require('../controllers/professorController');
const uploadProfilePicture = require('../middlewares/uploadProfilePicture');

const router = express.Router();

router.use(authMiddleware);
router.use(checkRoles('PROFESSOR'));

router.get('/dashboard', professorController.getDashboard);
router.get('/profile', professorController.getProfile);
router.put('/profile', professorController.updateProfile);
router.post(
  '/profile-picture',
  uploadProfilePicture,
  professorController.uploadProfilePicture,
);
router.get('/settings', professorController.getSettings);
router.put('/settings/password', professorController.updateSettingsPassword);
router.put('/settings/privacy', professorController.updateSettingsPrivacy);
router.put(
  '/settings/notifications',
  professorController.updateSettingsNotifications,
);
router.get('/validations/stats', professorController.getValidationStats);
router.get('/validations', professorController.listValidations);
router.get(
  '/validations/:itemType/:itemId',
  professorController.getValidationDetail,
);
router.patch(
  '/validations/:itemType/:itemId/approve',
  professorController.approveValidation,
);
router.patch(
  '/validations/:itemType/:itemId/reject',
  professorController.rejectValidation,
);
router.patch(
  '/validations/:itemType/:itemId/request-changes',
  professorController.requestValidationChanges,
);

module.exports = router;
