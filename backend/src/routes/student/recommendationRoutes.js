'use strict';

const express = require('express');
const recommendationController = require('../../controllers/student/recommendationController');
const {
  updateRecommendationVisibilityRules,
  updateRecommendationStatusRules,
  handleValidationErrors,
} = require('../../middlewares/validationRules');

const router = express.Router();

router.get('/recommendations', recommendationController.getRecommendations);
router.get('/recommendations/:recommendationId', recommendationController.getRecommendationById);
router.patch(
  '/recommendations/:recommendationId/visibility',
  updateRecommendationVisibilityRules,
  handleValidationErrors,
  recommendationController.updateRecommendationVisibility,
);
router.patch(
  '/recommendations/:recommendationId/status',
  updateRecommendationStatusRules,
  handleValidationErrors,
  recommendationController.updateRecommendationStatus,
);

module.exports = router;
