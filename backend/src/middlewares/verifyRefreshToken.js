'use strict';

const jwt = require('jsonwebtoken');
const logger = require('../logs/logger');

const verifyRefreshToken = (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token manquant - veuillez vous reconnecter',
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    req.user = {
      userId: decoded.userId,
    };

    logger.info({
      message: 'Refresh token verifie',
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

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expiree - veuillez vous reconnecter',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Refresh token invalide',
    });
  }
};

module.exports = verifyRefreshToken;
