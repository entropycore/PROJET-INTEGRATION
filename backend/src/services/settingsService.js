'use strict';

const prisma = require('../config/prisma');

// Retourne les préférences par défaut pour un étudiant 
const getDefaultStudentPreferences = () => {
  return {
    schema_version: 1,
    notifications: {
      project_validation: true,
      new_recommendation: true,
      new_comment: true,
      email_alerts: false
    },
    privacy: {
      portfolio_public: true,
      show_credibility_score: true
    }
  };
};

/**
 * Effectue un "Deep Merge" pour fusionner les nouvelles préférences avec les anciennes
 * sans écraser les objets imbriqués non modifiés.
 */
const mergePreferences = (existing, updates) => {
  const result = { ...existing };
  for (const key in updates) {
    if (typeof updates[key] === 'object' && updates[key] !== null && !Array.isArray(updates[key])) {
      result[key] = mergePreferences(existing[key] || {}, updates[key]);
    } else {
      result[key] = updates[key];
    }
  }
  return result;
};

/**
 * Récupère les préférences de l'utilisateur connecté
 */
exports.getUserPreferences = async (userId, userRole) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferences: true }
  });

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  const currentPrefs = user.preferences || {};

  // Si les préférences sont vides (ou contiennent uniquement la version), 
  // on initialise avec les valeurs par défaut selon le rôle
  if (Object.keys(currentPrefs).length <= 1 && userRole === 'STUDENT') {
    return getDefaultStudentPreferences();
  }

  return currentPrefs;
};

/**
 * Met à jour (PATCH) les préférences de l'utilisateur
 */
exports.updateUserPreferences = async (userId, userRole, updates) => {
  // 1. Récupérer les préférences actuelles
  const currentPrefs = await this.getUserPreferences(userId, userRole);

  // 2. Fusionner avec les nouvelles valeurs
  const mergedPreferences = mergePreferences(currentPrefs, updates);

  // 3. Sauvegarder dans la base de données
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { preferences: mergedPreferences },
    select: { preferences: true }
  });

  return updatedUser.preferences;
};