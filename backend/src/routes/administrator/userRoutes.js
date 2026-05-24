'use strict';

const express = require('express');
const profileController = require('../../controllers/administrator/profileController');
const userController = require('../../controllers/administrator/userController');

const router = express.Router();

router.get('/profile', profileController.getProfile);
router.get('/users', userController.listUsers);
router.post('/users', userController.createUser);
router.get('/users/:userId', userController.getUserById);
router.put('/users/:userId', userController.updateUser);
router.patch('/users/:userId/status', userController.updateUserStatus);
router.patch('/users/:userId/role', userController.updateUserRole);
router.patch('/users/:userId/reset-password', userController.resetUserPassword);
router.delete('/users/:userId', userController.deleteUser);

module.exports = router;
