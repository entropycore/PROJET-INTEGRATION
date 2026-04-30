'use strict';

const { createLogger, format, transports } = require('winston');
const path = require('path');

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    // Terminal — développement
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          return `[${timestamp}] ${level}: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta) : ''
          }`;
        })
      )
    }),
    // Fichier erreurs
    new transports.File({
      filename: path.join('src', 'logs', 'error.log'),
      level: 'error'
    }),
    // Fichier toutes les requêtes
    new transports.File({
      filename: path.join('src', 'logs', 'combined.log')
    })
  ]
});

module.exports = logger;