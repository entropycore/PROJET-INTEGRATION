'use strict';

const express = require('express');
const publicPortfolioController = require('../controllers/publicPortfolioController');

const router = express.Router();

router.get('/', publicPortfolioController.listPublicPortfolios);
router.get('/:slug', publicPortfolioController.getPublicPortfolio);

module.exports = router;
