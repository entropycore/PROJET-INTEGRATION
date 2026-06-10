'use strict';

const express = require('express');
const badgeController = require('../../controllers/administrator/badgeController');
const {
  createBadgeRules,
  updateBadgeRules,
  handleValidationErrors,
} = require('../../middlewares/validationRules');

const router = express.Router();

router.get('/badges', badgeController.listBadges);
router.post('/badges', createBadgeRules, handleValidationErrors, badgeController.createBadge);
router.put('/badges/:badgeId', updateBadgeRules, handleValidationErrors, badgeController.updateBadge);
router.delete('/badges/:badgeId', badgeController.deleteBadge);

module.exports = router;
