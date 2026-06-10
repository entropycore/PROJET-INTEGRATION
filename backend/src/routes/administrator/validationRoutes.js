'use strict';

const express = require('express');
const validationController = require('../../controllers/administrator/validationController');
const { adminValidationActionRules, handleValidationErrors } = require('../../middlewares/validationRules');

const router = express.Router();

router.get('/validations/pending', validationController.listPendingValidationsLegacy);
router.get('/validations/pending-count', validationController.getPendingValidationCountsLegacy);
router.get(
  '/validations/:itemType/:itemId/files/:fileId/:action',
  validationController.downloadValidationFile,
);
router.get('/validations/:validationId', validationController.getLegacyValidationDetail);
router.patch('/validations/:validationId/approve', adminValidationActionRules, handleValidationErrors, validationController.approveLegacyValidationItem);
router.patch('/validations/:validationId/reject', adminValidationActionRules, handleValidationErrors, validationController.rejectLegacyValidationItem);
router.patch(
  '/validations/:validationId/request-changes',
  adminValidationActionRules,
  handleValidationErrors,
  validationController.requestLegacyValidationChanges,
);
router.get('/validations', validationController.listValidationItems);
router.get('/validations/:itemType/:itemId', validationController.getValidationItemDetail);
router.patch('/validations/:itemType/:itemId/approve', adminValidationActionRules, handleValidationErrors, validationController.approveValidationItem);
router.patch('/validations/:itemType/:itemId/reject', adminValidationActionRules, handleValidationErrors, validationController.rejectValidationItem);

module.exports = router;
