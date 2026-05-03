'use strict';

const administratorService = require('../services/administratorService');
const { success, error } = require('../utils/apiResponse');

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < 1 ? fallback : parsed;
};

const parseEmailVerified = (value) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  throw new Error('INVALID_EMAIL_VERIFIED_FILTER');
};

const handleAdminError = (err, res, next) => {
  if (err.message === 'INVALID_ROLE_FILTER') {
    return error(res, 400, 'Filtre role invalide.');
  }

  if (err.message === 'INVALID_STATUS_FILTER') {
    return error(res, 400, 'Filtre status invalide.');
  }

  if (err.message === 'INVALID_EMAIL_VERIFIED_FILTER') {
    return error(res, 400, 'Filtre emailVerified invalide.');
  }

  if (err.message === 'USER_NOT_FOUND') {
    return error(res, 404, 'Utilisateur introuvable.');
  }

  if (err.message === 'PROFESSIONAL_REQUEST_NOT_FOUND') {
    return error(res, 404, 'Demande professionnelle introuvable.');
  }

  if (err.message === 'EMAIL_NOT_VERIFIED') {
    return error(res, 409, 'Le professionnel doit verifier son email avant validation.');
  }

  if (err.message === 'REQUEST_ALREADY_APPROVED') {
    return error(res, 409, 'Cette demande est deja approuvee.');
  }

  return next(err);
};

exports.getDashboard = async (req, res, next) => {
  try {
    const dashboard = await administratorService.getDashboardData();
    return success(res, 200, 'Tableau de bord administrateur charge.', dashboard);
  } catch (err) {
    return next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const profile = await administratorService.getAdministratorProfile(req.user.userId);

    if (!profile) {
      return error(res, 404, 'Profil administrateur introuvable.');
    }

    return success(res, 200, 'Profil administrateur charge.', profile);
  } catch (err) {
    return next(err);
  }
};

exports.listUsers = async (req, res, next) => {
  try {
    const data = await administratorService.listUsers({
      role: req.query.role?.toUpperCase(),
      status: req.query.status?.toUpperCase(),
      search: req.query.search?.trim(),
      page: parsePositiveInt(req.query.page, 1),
      limit: parsePositiveInt(req.query.limit, 10),
    });

    return success(res, 200, 'Liste des utilisateurs chargee.', data);
  } catch (err) {
    return handleAdminError(err, res, next);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await administratorService.getUserDetails(req.params.userId);
    return success(res, 200, 'Detail utilisateur charge.', user);
  } catch (err) {
    return handleAdminError(err, res, next);
  }
};

exports.listProfessionalRequests = async (req, res, next) => {
  try {
    const data = await administratorService.listProfessionalRequests({
      status: req.query.status?.toUpperCase(),
      emailVerified: parseEmailVerified(req.query.emailVerified),
      search: req.query.search?.trim(),
      page: parsePositiveInt(req.query.page, 1),
      limit: parsePositiveInt(req.query.limit, 10),
    });

    return success(res, 200, 'Demandes professionnelles chargees.', data);
  } catch (err) {
    return handleAdminError(err, res, next);
  }
};

exports.getProfessionalRequest = async (req, res, next) => {
  try {
    const request = await administratorService.getProfessionalRequest(req.params.userId);
    return success(res, 200, 'Demande professionnelle chargee.', request);
  } catch (err) {
    return handleAdminError(err, res, next);
  }
};

exports.approveProfessionalRequest = async (req, res, next) => {
  try {
    const request = await administratorService.approveProfessionalRequest(req.params.userId);
    return success(res, 200, 'Demande professionnelle approuvee.', request);
  } catch (err) {
    return handleAdminError(err, res, next);
  }
};

exports.rejectProfessionalRequest = async (req, res, next) => {
  try {
    const request = await administratorService.rejectProfessionalRequest(req.params.userId);
    return success(res, 200, 'Demande professionnelle rejetee.', request);
  } catch (err) {
    return handleAdminError(err, res, next);
  }
};
