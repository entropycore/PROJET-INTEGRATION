'use strict';

const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRoles = require('../middlewares/checkRoles');
const professorController = require('../controllers/professorController');
const notificationController = require('../controllers/userNotificationController');

const router = express.Router();

router.use(authMiddleware);
router.use(checkRoles('PROFESSOR'));

router.get('/dashboard', professorController.getDashboard);
router.get('/profile', professorController.getProfile);
router.get('/notifications', notificationController.listNotifications);
router.get('/notifications/unread-count', notificationController.getUnreadCount);
router.patch('/notifications/read-all', notificationController.markAllAsRead);
router.patch('/notifications/:notificationId/read', notificationController.markAsRead);
router.delete('/notifications/:notificationId', notificationController.deleteNotification);

module.exports = router;
