'use strict';

const express = require('express');
const validatorController = require('../../controllers/student/validatorController');

const router = express.Router();

router.get('/validators', validatorController.listValidators);

module.exports = router;
