'use strict';

const express = require('express');
const badgeController = require('../../controllers/administrator/badgeController');

const router = express.Router();

router.get('/badges', badgeController.listBadges);
router.post('/badges', badgeController.createBadge);
router.put('/badges/:badgeId', badgeController.updateBadge);
router.delete('/badges/:badgeId', badgeController.deleteBadge);

module.exports = router;
