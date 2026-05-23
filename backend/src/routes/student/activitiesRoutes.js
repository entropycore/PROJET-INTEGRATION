'use strict';
const express = require('express');
const studentActivityController = require('../../controllers/studentActivityController');
const uploadActivityCertificate = require('../../middlewares/uploadActivityCertificate');

const router = express.Router();

router.get('/activities', studentActivityController.listActivities);
router.get('/activities/:activityId', studentActivityController.getActivityById);
router.post('/activities', uploadActivityCertificate, studentActivityController.createActivity);

module.exports = router;