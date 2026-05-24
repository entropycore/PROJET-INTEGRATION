'use strict';

const express = require('express');
const recommendationController = require('../../controllers/student/recommendationController');

const router = express.Router();

router.get('/recommendations', recommendationController.getRecommendations);
router.patch('/recommendations/:recommendationId/status', recommendationController.updateRecommendationStatus);

module.exports = router;
