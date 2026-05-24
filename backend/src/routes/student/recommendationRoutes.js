'use strict';

const express = require('express');
const recommendationController = require('../../controllers/student/recommendationController');

const router = express.Router();

router.get('/recommendations', recommendationController.getRecommendations);
router.get('/recommendations/:recommendationId', recommendationController.getRecommendationById);
router.patch(
  '/recommendations/:recommendationId/visibility',
  recommendationController.updateRecommendationVisibility,
);
router.patch(
  '/recommendations/:recommendationId/status',
  recommendationController.updateRecommendationStatus,
);

module.exports = router;
