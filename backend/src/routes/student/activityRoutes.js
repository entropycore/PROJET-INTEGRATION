'use strict';

const express = require('express');
const studentActivityController = require('../../controllers/studentActivityController');
const uploadActivityCertificate = require('../../middlewares/uploadActivityCertificate');
const {
  createActivityRules,
  updateActivityRules,
  handleValidationErrors,
} = require('../../middlewares/validationRules');

const router = express.Router();

router.get('/activities', studentActivityController.listActivities);
router.post(
  '/activities',
  uploadActivityCertificate,
  createActivityRules,
  handleValidationErrors,
  studentActivityController.createActivity,
);
router.get('/activities/:activityId', studentActivityController.getActivityById);
router.put(
  '/activities/:activityId',
  uploadActivityCertificate,
  updateActivityRules,
  handleValidationErrors,
  studentActivityController.updateActivity,
);
router.delete('/activities/:activityId', studentActivityController.deleteActivity);
router.post(
  '/activities/:activityId/submit-validation',
  studentActivityController.submitActivityValidation,
);
router.post(
  '/activities/:activityId/certificate',
  uploadActivityCertificate,
  studentActivityController.uploadActivityCertificate,
);
router.get(
  '/activities/:activityId/certificate/download',
  studentActivityController.downloadActivityCertificate,
);

module.exports = router;
