'use strict';

const administratorService = require('../services/administratorService');
const { success, error } = require('../utils/apiResponse');

const VALID_ACCOUNT_STATUSES = new Set(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING']);
const VALID_USER_ROLES = new Set(['STUDENT', 'PROFESSOR', 'ADMINISTRATOR', 'PROFESSIONAL']);

const parseEmailVerifiedFilter = (value) => {
  if (typeof value === 'undefined') return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
};

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < 1 ? fallback : parsed;
};

const normalizeRole = (value) => (typeof value === 'string' ? value.toUpperCase() : value);
const normalizeStatus = (value) => (typeof value === 'string' ? value.toUpperCase() : value);

const handleAdminError = (res, err) => {
  if (err.message === 'REQUEST_NOT_FOUND') {
    return error(res, 404, 'Demande professionnelle introuvable.');
  }

  if (err.message === 'USER_NOT_FOUND') {
    return error(res, 404, 'Utilisateur introuvable.');
  }

  if (err.message === 'ADMIN_PROFILE_NOT_FOUND') {
    return error(res, 404, 'Profil administrateur introuvable.');
  }

  if (err.message === 'EMAIL_NOT_VERIFIED') {
    return error(res, 409, "L'email du professionnel doit etre verifie avant approbation.");
  }

  if (err.message === 'REQUEST_ALREADY_APPROVED') {
    return error(res, 409, 'Cette demande a deja ete approuvee.');
  }

  if (err.message === 'INVALID_REQUEST_STATE') {
    return error(res, 409, 'Cette demande ne peut pas etre traitee dans son etat actuel.');
  }

  if (err.message === 'INVALID_ROLE') {
    return error(res, 400, 'Le role fourni est invalide.');
  }

  if (err.message === 'INVALID_STATUS') {
    return error(res, 400, 'Le status fourni est invalide.');
  }

  if (err.message === 'MISSING_REQUIRED_FIELDS') {
    return error(res, 400, 'Les champs obligatoires sont manquants.');
  }

  if (err.message === 'MISSING_STUDENT_FIELDS') {
    return error(res, 400, 'Les champs major et level sont obligatoires pour un etudiant.');
  }

  if (err.message === 'EMAIL_ALREADY_EXISTS') {
    return error(res, 409, 'Cet email est deja utilise.');
  }

  if (err.message === 'ROLE_CHANGE_REQUIRES_DEDICATED_ENDPOINT') {
    return error(res, 400, 'Utilisez la route dediee pour changer le role.');
  }

  if (err.message === 'ROLE_CHANGE_BLOCKED_BY_RELATED_DATA') {
    return error(
      res,
      409,
      'Le changement de role est bloque car ce compte possede deja des donnees metier liees.'
    );
  }

  if (err.message === 'USE_PROFESSIONAL_APPROVAL_FLOW') {
    return error(res, 409, 'Utilisez le workflow de validation professionnelle pour activer ce compte.');
  }

  if (err.message === 'CANNOT_DELETE_SELF') {
    return error(res, 409, 'Vous ne pouvez pas supprimer votre propre compte administrateur.');
  }

  if (err.code === 'P2002') {
    return error(res, 409, 'Une valeur unique existe deja en base.');
  }

  return null;
};

exports.getDashboard = async (req, res, next) => {
  try {
    const dashboard = await administratorService.getDashboardData();
    return success(res, 200, 'Tableau de bord administrateur charge.', dashboard);
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const profile = await administratorService.getAdministratorProfile(req.user.userId);
    return success(res, 200, 'Profil administrateur charge.', profile);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.listUsers = async (req, res, next) => {
  try {
    const role = normalizeRole(req.query.role);
    const status = normalizeStatus(req.query.status);

    if (role && !VALID_USER_ROLES.has(role)) {
      return error(res, 400, 'Le filtre role est invalide.');
    }

    if (status && !VALID_ACCOUNT_STATUSES.has(status)) {
      return error(res, 400, 'Le filtre status est invalide.');
    }

    const data = await administratorService.listUsers({
      role,
      status,
      search: req.query.search?.trim(),
      page: parsePositiveInt(req.query.page, 1),
      limit: parsePositiveInt(req.query.limit, 10),
    });

    return success(res, 200, 'Utilisateurs recuperes.', data);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await administratorService.getUserById(req.params.userId);
    return success(res, 200, 'Utilisateur recupere.', user);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const result = await administratorService.createUser({
      ...req.body,
      role: normalizeRole(req.body?.role),
      accountStatus: normalizeStatus(req.body?.accountStatus),
    });

    return success(res, 201, 'Utilisateur cree.', result);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await administratorService.updateUser(req.params.userId, {
      ...req.body,
      role: normalizeRole(req.body?.role),
    });

    return success(res, 200, 'Utilisateur mis a jour.', user);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const status = normalizeStatus(req.body?.status);
    if (!status || !VALID_ACCOUNT_STATUSES.has(status)) {
      return error(res, 400, 'Le status fourni est invalide.');
    }

    const user = await administratorService.updateUserStatus(
      req.params.userId,
      status,
      req.user.roleId,
      typeof req.body?.reason === 'string' ? req.body.reason.trim() || null : null
    );

    return success(res, 200, 'Status utilisateur mis a jour.', user);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const role = normalizeRole(req.body?.role);
    if (!role || !VALID_USER_ROLES.has(role)) {
      return error(res, 400, 'Le role fourni est invalide.');
    }

    const user = await administratorService.updateUserRole(req.params.userId, role, req.body);
    return success(res, 200, 'Role utilisateur mis a jour.', user);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.resetUserPassword = async (req, res, next) => {
  try {
    const result = await administratorService.resetUserPassword(req.params.userId);
    return success(res, 200, 'Mot de passe reinitialise.', result);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const result = await administratorService.deleteUser(req.params.userId, req.user.userId);
    return success(res, 200, 'Utilisateur supprime.', result);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.listProfessionalRequests = async (req, res, next) => {
  try {
    const status = normalizeStatus(req.query.status || 'PENDING');
    const emailVerified = parseEmailVerifiedFilter(req.query.emailVerified);

    if (!VALID_ACCOUNT_STATUSES.has(status)) {
      return error(res, 400, 'Le filtre status est invalide.');
    }

    if (emailVerified === null) {
      return error(res, 400, "Le filtre emailVerified doit valoir 'true' ou 'false'.");
    }

    const requests = await administratorService.listProfessionalRequests({
      status,
      emailVerified,
      search: req.query.search?.trim(),
      page: parsePositiveInt(req.query.page, 1),
      limit: parsePositiveInt(req.query.limit, 10),
    });

    return success(res, 200, 'Demandes professionnelles recuperees.', {
      filters: { status, emailVerified },
      ...requests,
    });
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.getProfessionalRequest = async (req, res, next) => {
  try {
    const request = await administratorService.getProfessionalRequest(req.params.userId);
    return success(res, 200, 'Demande professionnelle recuperee.', request);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.approveProfessionalRequest = async (req, res, next) => {
  try {
    const request = await administratorService.approveProfessionalRequest(
      req.params.userId,
      req.user.roleId
    );

    return success(res, 200, 'Demande professionnelle approuvee.', request);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.rejectProfessionalRequest = async (req, res, next) => {
  try {
    const rejectionReason =
      typeof req.body?.rejectionReason === 'string'
        ? req.body.rejectionReason.trim() || null
        : null;

    const request = await administratorService.rejectProfessionalRequest(
      req.params.userId,
      req.user.roleId,
      rejectionReason
    );

    return success(res, 200, 'Demande professionnelle rejetee.', request);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};
