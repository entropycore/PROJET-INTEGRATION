'use strict';
const express = require('express');
const settingsController = require('../../controllers/student/settingsController');
const router = express.Router();

router.get('/', settingsController.getSettings);
router.get('/settings', settingsController.getSettings);
router.put('/password', settingsController.updateSettingsPassword);
router.put('/privacy', settingsController.updateSettingsPrivacy);
router.put('/notifications', settingsController.updateSettingsNotifications);

module.exports = router;
