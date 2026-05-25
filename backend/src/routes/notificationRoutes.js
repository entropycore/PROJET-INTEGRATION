'use strict';

const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const notificationController = require('../controllers/userNotificationController');

const router = express.Router();

router.use(authMiddleware);

router.get('/me/unread', notificationController.getMyUnreadNotifications);

module.exports = router;
