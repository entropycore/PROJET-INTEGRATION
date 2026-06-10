'use strict';

const express = require('express');
const studentStageController = require('../../controllers/studentStageController');
const uploadStageMedia = require('../../middlewares/uploadStageMedia');
const {
  createStageRules,
  updateStageRules,
  updateVisibilityRules,
  addTechnologiesRules,
  handleValidationErrors,
} = require('../../middlewares/validationRules');

const router = express.Router();

router.get('/stages', studentStageController.listStages);
router.get('/stages/:stageId', studentStageController.getStageById);
router.post('/stages', createStageRules, handleValidationErrors, studentStageController.createStage);
router.put('/stages/:stageId', updateStageRules, handleValidationErrors, studentStageController.updateStage);
router.delete('/stages/:stageId', studentStageController.deleteStage);
router.post('/stages/:stageId/submit-validation', studentStageController.submitStageValidation);
router.patch('/stages/:stageId/visibility', updateVisibilityRules, handleValidationErrors, studentStageController.updateStageVisibility);
router.post('/stages/:stageId/report', uploadStageMedia, studentStageController.updateStageReport);
router.get('/stages/:stageId/report/download', studentStageController.downloadStageReport);
router.post('/stages/:stageId/images', uploadStageMedia, studentStageController.uploadStageImages);
router.get('/stages/:stageId/images/:mediaId/content', studentStageController.getStageImageContent);
router.delete('/stages/:stageId/images/:mediaId', studentStageController.deleteStageImage);
router.get('/stages/:stageId/validation-history', studentStageController.getStageValidationHistory);
router.post('/stages/:stageId/technologies', addTechnologiesRules, handleValidationErrors, studentStageController.addStageTechnologies);
router.delete(
  '/stages/:stageId/technologies/:technologyId',
  studentStageController.removeStageTechnology,
);

module.exports = router;
