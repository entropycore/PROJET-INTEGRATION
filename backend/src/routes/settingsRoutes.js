'use strict';

const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const authMiddleware = require('../middlewares/authMiddleware');

// Toutes les routes de paramètres nécessitent d'être connecté
router.use(authMiddleware);

// Routes pour les préférences personnelles (JSONB)
router.get('/preferences', settingsController.getPreferences);
router.patch('/preferences', settingsController.updatePreferences);

module.exports = router;