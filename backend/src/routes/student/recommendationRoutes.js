'use strict';

const express = require('express');
const recommendationController = require('../../controllers/student/recommendationController');

const router = express.Router();

router.get('/recommendations', recommendationController.getRecommendations);

module.exports = router;
