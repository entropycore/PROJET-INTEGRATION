'use strict';

const administratorService = require('../../services/administratorService');
const adminCsvImportService = require('../../services/adminCsvImportService');
const { success, error } = require('../../utils/apiResponse');
const {
  VALID_ACCOUNT_STATUSES,
  VALID_USER_ROLES,
  VALID_VALIDATION_STATUSES,
  VALID_VALIDATION_TYPES,
  VALID_NOTIFICATION_TYPES,
  VALID_REPORT_STATUSES,
  VALID_REPORT_TARGET_TYPES,
  parseBooleanFilter,
  parsePositiveInt,
  normalizeRole,
  normalizeStatus,
  normalizeItemType,
  handleAdminError,
} = require('./shared');

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

exports.importUsersCsv = async (req, res, next) => {
  try {
    if (!req.file?.buffer) {
      return error(res, 400, 'Ajoutez un fichier CSV a importer.');
    }

    const result = await adminCsvImportService.importUsersFromCsv(req.file.buffer);
    return success(res, 201, 'Import CSV termine.', result);
  } catch (err) {
    if (err.message === 'CSV_EMPTY') {
      return error(
        res,
        400,
        'Le fichier CSV doit contenir une ligne d en-tete et au moins un utilisateur.'
      );
    }

    if (err.message === 'CSV_MISSING_REQUIRED_COLUMNS') {
      return error(
        res,
        400,
        'Le fichier CSV doit contenir les colonnes firstName, lastName, email et role.'
      );
    }

    if (err.message === 'CSV_FILE_REQUIRED') {
      return error(res, 400, 'Ajoutez un fichier CSV a importer.');
    }

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

    const user = await administratorService.updateUserRole(
      req.params.userId,
      role,
      req.body,
      req.user.userId
    );
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
