'use strict';

const express = require('express');
const settingsController = require('../../controllers/student/settingsController');

const router = express.Router();

router.put('/settings/password', settingsController.updateSettingsPassword);
router.put('/settings/privacy', settingsController.updateSettingsPrivacy);
router.put('/settings/notifications', settingsController.updateSettingsNotifications);

module.exports = router;
