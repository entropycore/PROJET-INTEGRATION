'use strict';

const settingsService = require('../services/settingsService');

/**
 * GET /api/settings/preferences
 * Récupère les préférences de l'utilisateur connecté
 */
exports.getPreferences = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role; // Assurez-vous que le rôle est injecté par votre authMiddleware

    const preferences = await settingsService.getUserPreferences(userId, userRole);
    
    res.status(200).json({ 
      success: true, 
      data: preferences 
    });
  } catch (err) {
    if (err.message === 'USER_NOT_FOUND') {
      return res.status(404).json({ success: false, message: "Utilisateur introuvable." });
    }
    next(err);
  }
};

/**
 * PATCH /api/settings/preferences
 * Met à jour partiellement les préférences de l'utilisateur
 */
exports.updatePreferences = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const updates = req.body; // Le JSON envoyé par le Frontend (ex: { privacy: { portfolio_public: false } })

    const updatedPreferences = await settingsService.updateUserPreferences(userId, userRole, updates);
    
    res.status(200).json({ 
      success: true, 
      message: "Préférences mises à jour avec succès.",
      data: updatedPreferences 
    });
  } catch (err) {
    next(err);
  }
};