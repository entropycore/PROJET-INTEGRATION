'use strict';

const jwt = require('jsonwebtoken');
const logger = require('../logs/logger');

const getAccessToken = (req) => {
  const cookieToken = req.cookies?.accessToken;
  if (cookieToken) return cookieToken;

  const authorization =
    (typeof req.get === 'function' ? req.get('authorization') : req.headers?.authorization) || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme?.toLowerCase() === 'bearer' && token) {
    return token;
  }

  return null;
};

const authMiddleware = (req, res, next) => {
  try {
    const token = getAccessToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Accès refusé — authentification requise',
      });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      roleId: decoded.roleId,
    };

    logger.info({
      message: 'Acces autorise',
      userId: req.user.userId,
      role: req.user.role,
      method: req.method,
      url: req.url,
      ip: req.ip,
    });

    return next();
  } catch (err) {
    logger.warn({
      message: 'Tentative acces non autorise',
      error: err.name,
      method: req.method,
      url: req.url,
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
      message: 'Token invalide',
    });
  }
};

module.exports = authMiddleware;
