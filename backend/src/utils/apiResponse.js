'use strict';

// Réponse succès standardisée
const success = (res, statusCode = 200, message, data = null) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

// Réponse erreur standardisée
const error = (res, statusCode = 500, message, errors = null) => {
  const response = { success: false, message };
  if (errors !== null) response.errors = errors;
  return res.status(statusCode).json(response);
};

module.exports = { success, error };
