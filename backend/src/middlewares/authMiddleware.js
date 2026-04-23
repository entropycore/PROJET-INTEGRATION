'use strict';

const jwt = require('jsonwebtoken');
const logger = require('../logs/logger');

const authMiddleware = (req, res, next) => {
  try {
    // Lire l'access token depuis le cookie
    const token = req.cookies?.accessToken;

    // Pas de token → non autorisé
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Accès refusé — authentification requise',
      });
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Injecter les données dans req.user
    // Disponible dans tous les middlewares suivants
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      roleId: decoded.roleId,
    
    };

    // Logger l'accès pour audit sécurité
    logger.info({
      message: 'Accès autorisé',
      userId: req.user.userId,
      role: req.user.role,
      method: req.method,
      url: req.url,
      ip: req.ip,
    });

    next();
  } catch (err) {
    // Logger la tentative échouée
    logger.warn({
      message: 'Tentative accès non autorisé',
      error: err.name,
      method: req.method,
      url: req.url,
      ip: req.ip,
    });

    // Token expiré
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expirée — veuillez vous reconnecter',
      });
    }

    // Token invalide
    return res.status(401).json({
      success: false,
      message: 'Token invalide',
    });
  }
};

module.exports = authMiddleware;
