const express = require('express');
const router = express.Router();

const auth = require('../middlewares/authMiddleware');     
const { addTimelineRules, updateTimelineRules } = require('../modules/timeline/timeline.validation');
const { handleValidationErrors } = require('../middlewares/validationRules'); 

const controller = require('../controllers/timeline.controller');

router.use(auth);

router.get('/', controller.getMyTimeline);

router.post('/', addTimelineRules, handleValidationErrors, controller.addTimelineEntry);

router.put('/:id', updateTimelineRules, handleValidationErrors, controller.updateTimelineEntry);

router.delete('/:id', controller.deleteTimelineEntry);

module.exports = router;