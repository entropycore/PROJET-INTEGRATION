'use strict';

const express = require('express');
const professionalRequestController = require('../../controllers/administrator/professionalRequestController');

const router = express.Router();

router.get('/professional-requests', professionalRequestController.listProfessionalRequests);
router.get('/professional-requests/:userId', professionalRequestController.getProfessionalRequest);
router.patch(
  '/professional-requests/:userId/approve',
  professionalRequestController.approveProfessionalRequest,
);
router.patch(
  '/professional-requests/:userId/reject',
  professionalRequestController.rejectProfessionalRequest,
);

module.exports = router;
