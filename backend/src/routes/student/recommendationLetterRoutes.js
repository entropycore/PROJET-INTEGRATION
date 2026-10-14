'use strict';

const express = require('express');
const recommendationLetterController = require('../../controllers/student/recommendationLetterController');

const router = express.Router();

router.get(
  '/recommendation-letters',
  recommendationLetterController.getRecommendationLetters,
);
router.get(
  '/recommendation-letters/:letterId',
  recommendationLetterController.getRecommendationLetterById,
);
router.patch(
  '/recommendation-letters/:letterId/visibility',
  recommendationLetterController.updateRecommendationLetterVisibility,
);
router.patch(
  '/recommendation-letters/:letterId/downloadable',
  recommendationLetterController.updateRecommendationLetterDownloadable,
);

module.exports = router;
