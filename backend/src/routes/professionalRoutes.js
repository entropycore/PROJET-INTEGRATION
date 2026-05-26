'use strict';

const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRoles = require('../middlewares/checkRoles');
const professionalController = require('../controllers/professionalController');
const administratorController = require('../controllers/administratorController');

const router = express.Router();

router.use(authMiddleware);

router.get('/notifications', checkRoles('ADMINISTRATOR'), administratorController.listNotifications);
router.get(
  '/notifications/unread-count',
  checkRoles('ADMINISTRATOR'),
  administratorController.getUnreadNotificationsCount
);
router.patch(
  '/notifications/read-all',
  checkRoles('ADMINISTRATOR'),
  administratorController.markAllNotificationsAsRead
);
router.patch(
  '/notifications/:notificationId/read',
  checkRoles('ADMINISTRATOR'),
  administratorController.markNotificationAsRead
);
router.delete(
  '/notifications/:notificationId',
  checkRoles('ADMINISTRATOR'),
  administratorController.deleteNotification
);

router.use(checkRoles('PROFESSIONAL'));

router.get('/dashboard', professionalController.getDashboard);
router.get('/profile', professionalController.getProfile);

module.exports = router;
