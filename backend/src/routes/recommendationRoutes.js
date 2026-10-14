'use strict';

const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const recommendationController = require('../controllers/recommendationController');

const router = express.Router();

router.use(authMiddleware);

router.get('/:recommendationId', recommendationController.getRecommendationById);
router.post('/:recommendationId/report', recommendationController.reportRecommendation);

module.exports = router;
