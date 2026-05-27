'use strict';

const express = require('express');
const notificationController = require('../../controllers/student/notificationController');

const router = express.Router();

router.get('/notifications', notificationController.listNotifications);
router.get('/notifications/unread-count', notificationController.getUnreadNotificationsCount);
router.patch('/notifications/read-all', notificationController.markAllNotificationsAsRead);
router.patch('/notifications/:notificationId/read', notificationController.markNotificationAsRead);
router.delete('/notifications/:notificationId', notificationController.deleteNotification);

module.exports = router;
