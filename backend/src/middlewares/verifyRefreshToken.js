'use strict';

const jwt = require('jsonwebtoken');
const logger = require('../logs/logger');

const verifyRefreshToken = (req, res, next) => {
  try {
    // Lire le refresh token depuis le cookie
    const refreshToken = req.cookies?.refreshToken;

    // Pas de refresh token
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token manquant — veuillez vous reconnecter',
      });
    }

    // Vérifier avec REFRESH_TOKEN_SECRET
    // Différent de ACCESS_TOKEN_SECRET — plus sécurisé
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Injecter dans req.user
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    logger.info({
      message: 'Refresh token vérifié',
      userId: req.user.userId,
      ip: req.ip,
    });

    next();
  } catch (err) {
    logger.warn({
      message: 'Refresh token invalide',
      error: err.name,
      ip: req.ip,
    });

    // Token expiré → reconnexion obligatoire
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expirée — veuillez vous reconnecter',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Refresh token invalide',
    });
  }
};

module.exports = verifyRefreshToken;
