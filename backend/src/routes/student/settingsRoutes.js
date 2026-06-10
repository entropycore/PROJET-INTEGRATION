'use strict';
const express = require('express');
const settingsController = require('../../controllers/student/settingsController');
const {
  updatePasswordRules,
  updatePrivacyRules,
  updateNotificationsRules,
  handleValidationErrors,
} = require('../../middlewares/validationRules');
const router = express.Router();

router.get('/', settingsController.getSettings);
router.put('/password', updatePasswordRules, handleValidationErrors, settingsController.updateSettingsPassword);
router.put('/privacy', updatePrivacyRules, handleValidationErrors, settingsController.updateSettingsPrivacy);
router.put('/notifications', updateNotificationsRules, handleValidationErrors, settingsController.updateSettingsNotifications);

module.exports = router;
