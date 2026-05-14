'use strict';

const administratorService = require('../services/administratorService');
const { success, error } = require('../utils/apiResponse');

const VALID_ACCOUNT_STATUSES = new Set(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING']);
const VALID_USER_ROLES = new Set(['STUDENT', 'PROFESSOR', 'ADMINISTRATOR', 'PROFESSIONAL']);
const VALID_VALIDATION_STATUSES = new Set(['PENDING', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED']);
const VALID_VALIDATION_TYPES = new Set([
  'CERTIFICATE_VALIDATION',
  'RECOMMENDATION_LETTER_VALIDATION',
  'COMMENT_VALIDATION',
  'RECOMMENDATION_VALIDATION',
]);
const VALID_NOTIFICATION_TYPES = new Set([
  'ACCESS_REQUEST',
  'CERTIFICATE_VALIDATION',
  'RECOMMENDATION_LETTER_VALIDATION',
  'COMMENT_VALIDATION',
  'RECOMMENDATION_VALIDATION',
  'REPORT',
  'SYSTEM',
]);
const VALID_REPORT_STATUSES = new Set(['PENDING', 'APPROVED', 'REJECTED']);
const VALID_REPORT_TARGET_TYPES = new Set([
  'PORTFOLIO',
  'COMMENT',
  'RECOMMENDATION',
  'PROJECT',
  'INTERNSHIP',
  'USER',
  'OTHER',
]);

const parseBooleanFilter = (value) => {
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
const normalizeItemType = (value) =>
  typeof value === 'string' ? value.trim().toUpperCase().replace(/-/g, '_') : value;

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

  if (err.message === 'DASHBOARD_ITEM_NOT_FOUND') {
    return error(res, 404, 'Element du dashboard introuvable.');
  }

  if (err.message === 'VALIDATION_ITEM_NOT_FOUND') {
    return error(res, 404, 'Element de validation introuvable.');
  }

  if (err.message === 'REPORT_NOT_FOUND') {
    return error(res, 404, 'Signalement introuvable.');
  }

  if (err.message === 'NOTIFICATION_NOT_FOUND') {
    return error(res, 404, 'Notification introuvable.');
  }

  if (err.message === 'INVALID_NOTIFICATION_TYPE') {
    return error(res, 400, 'Le type de notification est invalide.');
  }

  if (err.message === 'UNSUPPORTED_DASHBOARD_ITEM_TYPE') {
    return error(res, 400, "Le type d'element du dashboard n'est pas supporte.");
  }

  if (err.message === 'UNSUPPORTED_VALIDATION_TYPE') {
    return error(res, 400, "Le type de validation n'est pas supporte.");
  }

  if (err.message === 'UNSUPPORTED_REPORT_TARGET_TYPE') {
    return error(res, 400, "Le type de cible du signalement n'est pas supporte.");
  }

  if (err.message === 'INVALID_REPORT_STATUS') {
    return error(res, 400, 'Le status du signalement est invalide.');
  }

  if (err.message === 'UNSUPPORTED_DASHBOARD_ACTION_TYPE') {
    return error(res, 400, "L'action demandee n'est pas supportee pour ce type d'element.");
  }

  if (err.message === 'DASHBOARD_ITEM_INVALID_STATE') {
    return error(res, 409, "Cet element du dashboard ne peut pas etre traite dans son etat actuel.");
  }

  if (err.message === 'VALIDATION_ITEM_INVALID_STATE') {
    return error(res, 409, 'Cette validation ne peut pas etre traitee dans son etat actuel.');
  }

  if (err.message === 'REPORT_INVALID_STATE') {
    return error(res, 409, 'Ce signalement ne peut pas etre traite dans son etat actuel.');
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

  if (err.message === 'CANNOT_CHANGE_OWN_ROLE') {
    return error(res, 409, 'Vous ne pouvez pas modifier le role de votre propre compte administrateur.');
  }

  if (err.message === 'USER_DELETE_BLOCKED_BY_RELATED_DATA') {
    return error(
      res,
      409,
      'La suppression est impossible car ce compte est encore lie a des donnees metier.'
    );
  }

  if (err.code === 'P2002') {
    return error(res, 409, 'Une valeur unique existe deja en base.');
  }

  if (err.code === 'P2003') {
    return error(
      res,
      409,
      'La suppression est impossible car ce compte est encore lie a des donnees metier.'
    );
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

exports.getDashboardItemDetail = async (req, res, next) => {
  try {
    const item = await administratorService.getDashboardItemDetail(
      req.params.itemType,
      req.params.itemId
    );

    return success(res, 200, 'Element du dashboard recupere.', item);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.listValidationItems = async (req, res, next) => {
  try {
    const type = normalizeItemType(req.query.type);
    const status = normalizeStatus(req.query.status || 'PENDING');

    if (type && !VALID_VALIDATION_TYPES.has(type)) {
      return error(res, 400, 'Le filtre type est invalide.');
    }

    if (status && !VALID_VALIDATION_STATUSES.has(status)) {
      return error(res, 400, 'Le filtre status est invalide.');
    }

    const data = await administratorService.listValidationItems({
      type,
      status,
      search: req.query.search?.trim(),
      page: parsePositiveInt(req.query.page, 1),
      limit: parsePositiveInt(req.query.limit, 10),
    });

    return success(res, 200, 'Validations recuperees.', data);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.getValidationItemDetail = async (req, res, next) => {
  try {
    const item = await administratorService.getValidationItemDetail(
      req.params.itemType,
      req.params.itemId
    );

    return success(res, 200, 'Element de validation recupere.', item);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.approveValidationItem = async (req, res, next) => {
  try {
    const item = await administratorService.approveValidationItem(
      req.params.itemType,
      req.params.itemId,
      req.user.userId,
      req.user.roleId,
      req.body || {}
    );

    return success(res, 200, 'Validation approuvee.', item);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.rejectValidationItem = async (req, res, next) => {
  try {
    const item = await administratorService.rejectValidationItem(
      req.params.itemType,
      req.params.itemId,
      req.user.userId,
      req.user.roleId,
      req.body || {}
    );

    return success(res, 200, 'Validation rejetee.', item);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.listNotifications = async (req, res, next) => {
  try {
    const type = normalizeItemType(req.query.type);
    const isRead = parseBooleanFilter(req.query.isRead);

    if (type && !VALID_NOTIFICATION_TYPES.has(type)) {
      return error(res, 400, 'Le filtre type est invalide.');
    }

    if (isRead === null) {
      return error(res, 400, "Le filtre isRead doit valoir 'true' ou 'false'.");
    }

    const data = await administratorService.listNotifications({
      administratorId: req.user.roleId,
      type,
      isRead,
      search: req.query.search?.trim(),
      page: parsePositiveInt(req.query.page, 1),
      limit: parsePositiveInt(req.query.limit, 10),
    });

    return success(res, 200, 'Notifications recuperees.', data);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.markNotificationAsRead = async (req, res, next) => {
  try {
    const notification = await administratorService.markNotificationAsRead(
      req.params.notificationId,
      req.user.roleId
    );

    return success(res, 200, 'Notification marquee comme lue.', notification);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const result = await administratorService.markAllNotificationsAsRead(req.user.roleId);

    return success(res, 200, 'Toutes les notifications ont ete marquees comme lues.', result);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.listReports = async (req, res, next) => {
  try {
    const status = normalizeStatus(req.query.status || 'PENDING');
    const targetType = normalizeItemType(req.query.targetType);

    if (status && !VALID_REPORT_STATUSES.has(status)) {
      return error(res, 400, 'Le filtre status est invalide.');
    }

    if (targetType && !VALID_REPORT_TARGET_TYPES.has(targetType)) {
      return error(res, 400, 'Le filtre targetType est invalide.');
    }

    const data = await administratorService.listReports({
      status,
      targetType,
      search: req.query.search?.trim(),
      page: parsePositiveInt(req.query.page, 1),
      limit: parsePositiveInt(req.query.limit, 10),
    });

    return success(res, 200, 'Signalements recuperes.', data);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.getReportById = async (req, res, next) => {
  try {
    const report = await administratorService.getReportById(req.params.reportId);
    return success(res, 200, 'Signalement recupere.', report);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.approveReport = async (req, res, next) => {
  try {
    const report = await administratorService.approveReport(
      req.params.reportId,
      req.user.roleId,
      typeof req.body?.resolutionNote === 'string'
        ? req.body.resolutionNote.trim() || null
        : typeof req.body?.comment === 'string'
          ? req.body.comment.trim() || null
          : null
    );

    return success(res, 200, 'Signalement approuve.', report);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.rejectReport = async (req, res, next) => {
  try {
    const report = await administratorService.rejectReport(
      req.params.reportId,
      req.user.roleId,
      typeof req.body?.resolutionNote === 'string'
        ? req.body.resolutionNote.trim() || null
        : typeof req.body?.reason === 'string'
          ? req.body.reason.trim() || null
          : typeof req.body?.comment === 'string'
            ? req.body.comment.trim() || null
            : null
    );

    return success(res, 200, 'Signalement rejete.', report);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.approveDashboardItem = async (req, res, next) => {
  try {
    const item = await administratorService.approveDashboardItem(
      req.params.itemType,
      req.params.itemId,
      req.user.roleId,
      req.body || {}
    );

    return success(res, 200, 'Element du dashboard approuve.', item);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.rejectDashboardItem = async (req, res, next) => {
  try {
    const item = await administratorService.rejectDashboardItem(
      req.params.itemType,
      req.params.itemId,
      req.user.roleId,
      req.body || {}
    );

    return success(res, 200, 'Element du dashboard rejete.', item);
  } catch (err) {
    if (handleAdminError(res, err)) return;
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

exports.listProfessionalRequests = async (req, res, next) => {
  try {
    const status = normalizeStatus(req.query.status || 'PENDING');
    const emailVerified = parseBooleanFilter(req.query.emailVerified);

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
