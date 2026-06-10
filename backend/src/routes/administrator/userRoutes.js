'use strict';

const express = require('express');
const profileController = require('../../controllers/administrator/profileController');
const userController = require('../../controllers/administrator/userController');
const uploadCsv = require('../../middlewares/uploadCsv');
const {
  createUserRules,
  updateUserRules,
  updateUserStatusRules,
  updateUserRoleRules,
  handleValidationErrors,
} = require('../../middlewares/validationRules');

const router = express.Router();

router.get('/profile', profileController.getProfile);
router.get('/users', userController.listUsers);
router.post('/users/import-csv', uploadCsv.single('file'), userController.importUsersCsv);
router.post('/users', createUserRules, handleValidationErrors, userController.createUser);
router.get('/users/:userId', userController.getUserById);
router.put('/users/:userId', updateUserRules, handleValidationErrors, userController.updateUser);
router.patch('/users/:userId/status', updateUserStatusRules, handleValidationErrors, userController.updateUserStatus);
router.patch('/users/:userId/role', updateUserRoleRules, handleValidationErrors, userController.updateUserRole);
router.patch('/users/:userId/reset-password', userController.resetUserPassword);
router.delete('/users/:userId', userController.deleteUser);

module.exports = router;
