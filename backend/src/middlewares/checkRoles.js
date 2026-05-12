'use strict';

const logger = require('../logs/logger');


const checkRoles = (...rolesAutorises) => {
  return (req, res, next) => {
    // authMiddleware doit être appelé avant checkRoles
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise',
      });
    }

    const roleUtilisateur = req.user.role?.toUpperCase();

    // Vérifier si le rôle est autorisé
    if (!rolesAutorises.includes(roleUtilisateur)) {
      
      logger.warn({
        message: 'Accès refusé — rôle insuffisant',
        userId: req.user.userId,
        roleUtilisateur: roleUtilisateur,
        rolesRequis: rolesAutorises,
        method: req.method,
        url: req.url,
        ip: req.ip,
      });

      return res.status(403).json({
        success: false,
        message: 'Accès refusé — permissions insuffisantes',
      });
    }

    next();
  };
};

module.exports = checkRoles;
