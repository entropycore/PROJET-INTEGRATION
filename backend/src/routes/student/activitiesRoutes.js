'use strict';
const express = require('express');
const studentActivityController = require('../../controllers/studentActivityController');
const router = express.Router();

router.get('/activities', studentActivityController.listActivities);
router.get('/activities/:activityId', studentActivityController.getActivityById);

module.exports = router;