'use strict';

const express = require('express');
const studentPortfolioController = require('../../controllers/studentPortfolioController');

const router = express.Router();

router.get('/portfolio/preview', studentPortfolioController.getPreview);
router.post('/portfolio/generate', studentPortfolioController.generatePortfolio);

module.exports = router;
