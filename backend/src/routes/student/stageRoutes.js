'use strict';

const express = require('express');
const studentStageController = require('../../controllers/studentStageController');

const router = express.Router();

router.get('/stages', studentStageController.listStages);
router.get('/stages/:stageId', studentStageController.getStageById);
router.post('/stages', studentStageController.createStage);
router.put('/stages/:stageId', studentStageController.updateStage);
router.delete('/stages/:stageId', studentStageController.deleteStage);
router.post('/stages/:stageId/submit-validation', studentStageController.submitStageValidation);
router.patch('/stages/:stageId/visibility', studentStageController.updateStageVisibility);
router.post('/stages/:stageId/report', studentStageController.updateStageReport);
router.get('/stages/:stageId/validation-history', studentStageController.getStageValidationHistory);
router.post('/stages/:stageId/technologies', studentStageController.addStageTechnologies);
router.delete(
  '/stages/:stageId/technologies/:technologyId',
  studentStageController.removeStageTechnology,
);

module.exports = router;
