'use strict';

const administratorService = require('../services/administratorService');
const { success } = require('../utils/apiResponse');

const VALID_ACCOUNT_STATUSES = new Set(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING']);

const parseEmailVerifiedFilter = (value) => {
  if (typeof value === 'undefined') return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
};

const handleProfessionalRequestError = (res, err) => {
  if (err.message === 'REQUEST_NOT_FOUND') {
    return res.status(404).json({
      success: false,
      message: 'Demande professionnelle introuvable.',
    });
  }

  if (err.message === 'EMAIL_NOT_VERIFIED') {
    return res.status(409).json({
      success: false,
      message: "L'email du professionnel doit être vérifié avant approbation.",
    });
  }

  if (err.message === 'REQUEST_ALREADY_APPROVED') {
    return res.status(409).json({
      success: false,
      message: 'Cette demande a déjà été approuvée.',
    });
  }

  if (err.message === 'INVALID_REQUEST_STATE') {
    return res.status(409).json({
      success: false,
      message: 'Cette demande ne peut pas être traitée dans son état actuel.',
    });
  }

  return null;
};

exports.getDashboard = (req, res) => {
  return success(
    res,
    200,
    'Acces autorise a l espace administrateur',
    {
      area: 'administrator',
      user: req.user,
    }
  );
};

exports.getProfile = (req, res) => {
  return success(
    res,
    200,
    'Profil administrateur accessible',
    {
      user: req.user,
    }
  );
};

exports.listProfessionalRequests = async (req, res, next) => {
  try {
    const status = (req.query.status || 'PENDING').toUpperCase();
    const emailVerified = parseEmailVerifiedFilter(req.query.emailVerified);

    if (!VALID_ACCOUNT_STATUSES.has(status)) {
      return res.status(400).json({
        success: false,
        message: 'Le filtre status est invalide.',
      });
    }

    if (emailVerified === null) {
      return res.status(400).json({
        success: false,
        message: "Le filtre emailVerified doit valoir 'true' ou 'false'.",
      });
    }

    const requests = await administratorService.listProfessionalRequests({
      status,
      emailVerified,
    });

    return success(res, 200, 'Demandes professionnelles récupérées.', {
      filters: { status, emailVerified },
      requests,
    });
  } catch (err) {
    next(err);
  }
};

exports.getProfessionalRequest = async (req, res, next) => {
  try {
    const request = await administratorService.getProfessionalRequest(req.params.userId);

    return success(res, 200, 'Demande professionnelle récupérée.', request);
  } catch (err) {
    if (handleProfessionalRequestError(res, err)) return;
    next(err);
  }
};

exports.approveProfessionalRequest = async (req, res, next) => {
  try {
    const request = await administratorService.approveProfessionalRequest(req.params.userId);

    return success(res, 200, 'Demande professionnelle approuvée.', request);
  } catch (err) {
    if (handleProfessionalRequestError(res, err)) return;
    next(err);
  }
};

exports.rejectProfessionalRequest = async (req, res, next) => {
  try {
    const request = await administratorService.rejectProfessionalRequest(req.params.userId);

    return success(res, 200, 'Demande professionnelle rejetée.', request);
  } catch (err) {
    if (handleProfessionalRequestError(res, err)) return;
    next(err);
  }
};
