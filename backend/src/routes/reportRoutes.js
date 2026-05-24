'use strict';

const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const reportController = require('../controllers/reportController');
const { validationRules, handleValidationErrors } = require('../middlewares/validationRules');

const router = express.Router();

router.use(authMiddleware);

router.post(
  '/',
  validationRules('createReport'),
  handleValidationErrors,
  reportController.createReport
);

module.exports = router;
