'use strict';
const cors = require('cors');

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.some(o => o && o === origin)
  || /^http:\/\/(192\.168|10|100|172)\.\d+\.\d+/.test(origin);
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`CORS bloqué — origine non autorisée : ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400,
};

module.exports = cors(corsOptions);