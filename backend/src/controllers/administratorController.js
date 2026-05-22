'use strict';

const administratorService = require('../services/administratorService');
const { success, error } = require('../utils/apiResponse');
const {
  VALID_ACCOUNT_STATUSES,
  VALID_LEGACY_VALIDATION_TYPES,
  VALID_NOTIFICATION_TYPES,
  VALID_REPORT_STATUSES,
  VALID_REPORT_TARGET_TYPES,
  VALID_USER_ROLES,
  VALID_VALIDATION_STATUSES,
  VALID_VALIDATION_TYPES,
  getReportStatusFilter,
  handleAdminError,
  normalizeItemType,
  normalizeRole,
  normalizeStatus,
  parseBooleanFilter,
  parsePositiveInt,
  readBodyText,
} = require('./administratorHelpers');

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
    const item = await administratorService.getDashboardItemDetail(req.params.itemType, req.params.itemId);

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

exports.listPendingValidationsLegacy = async (req, res, next) => {
  try {
    const type = normalizeItemType(req.query.type);
    const status = normalizeStatus(req.query.status || 'PENDING');

    if (type && !VALID_LEGACY_VALIDATION_TYPES.has(type)) {
      return error(res, 400, 'Le filtre type legacy est invalide.');
    }

    if (status && !VALID_VALIDATION_STATUSES.has(status)) {
      return error(res, 400, 'Le filtre status est invalide.');
    }

    const data = await administratorService.listPendingValidationsLegacy({
      type,
      status,
      search: req.query.search?.trim(),
      page: parsePositiveInt(req.query.page, 1),
      limit: parsePositiveInt(req.query.limit, 10),
    });

    return success(res, 200, 'Validations en attente recuperees.', data);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.getPendingValidationCountsLegacy = async (req, res, next) => {
  try {
    const data = await administratorService.getPendingValidationCountsLegacy();
    return success(res, 200, 'Compteurs des validations en attente recuperes.', data);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.getValidationItemDetail = async (req, res, next) => {
  try {
    const item = await administratorService.getValidationItemDetail(req.params.itemType, req.params.itemId);

    return success(res, 200, 'Element de validation recupere.', item);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.getLegacyValidationDetail = async (req, res, next) => {
  try {
    const item = await administratorService.getLegacyValidationDetail(req.params.validationId);
    return success(res, 200, 'Validation recuperee.', item);
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
      req.body || {},
    );

    return success(res, 200, 'Validation approuvee.', item);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.approveLegacyValidationItem = async (req, res, next) => {
  try {
    const item = await administratorService.approveLegacyValidationItem(
      req.params.validationId,
      req.user.userId,
      req.user.roleId,
      req.body || {},
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
      req.body || {},
    );

    return success(res, 200, 'Validation rejetee.', item);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.rejectLegacyValidationItem = async (req, res, next) => {
  try {
    const item = await administratorService.rejectLegacyValidationItem(
      req.params.validationId,
      req.user.userId,
      req.user.roleId,
      req.body || {},
    );

    return success(res, 200, 'Validation rejetee.', item);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.requestLegacyValidationChanges = async (req, res, next) => {
  try {
    const item = await administratorService.requestLegacyValidationChanges(
      req.params.validationId,
      req.user.userId,
      req.user.roleId,
      req.body || {},
    );

    return success(res, 200, 'Demande de correction envoyee.', item);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.listNotifications = async (req, res, next) => {
  try {
    const type = normalizeItemType(req.query.type);
    const isRead = parseBooleanFilter(typeof req.query.isRead !== 'undefined' ? req.query.isRead : req.query.read);

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

exports.getUnreadNotificationsCount = async (req, res, next) => {
  try {
    const count = await administratorService.getUnreadNotificationsCount(req.user.roleId);
    return success(res, 200, 'Compteur des notifications non lues recupere.', { count });
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.markNotificationAsRead = async (req, res, next) => {
  try {
    const notification = await administratorService.markNotificationAsRead(req.params.notificationId, req.user.roleId);

    return success(res, 200, 'Notification marquee comme lue.', notification);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const result = await administratorService.deleteNotification(req.params.notificationId, req.user.roleId);

    return success(res, 200, 'Notification supprimee.', result);
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
    const status = getReportStatusFilter(req.query.status);
    const targetType = normalizeItemType(req.query.targetType || req.query.type);

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

exports.getPendingReportsCountLegacy = async (req, res, next) => {
  try {
    const count = await administratorService.getPendingReportsCount();
    return success(res, 200, 'Compteur des signalements en attente recupere.', { count });
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
      readBodyText(req.body, ['resolutionNote', 'comment']),
    );

    return success(res, 200, 'Signalement approuve.', report);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.resolveLegacyReport = async (req, res, next) => {
  try {
    const report = await administratorService.resolveReportLegacy(
      req.params.reportId,
      req.user.roleId,
      readBodyText(req.body, ['resolutionNote', 'comment']),
    );

    return success(res, 200, 'Signalement traite.', report);
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
      readBodyText(req.body, ['resolutionNote', 'reason', 'comment']),
    );

    return success(res, 200, 'Signalement rejete.', report);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.deleteLegacyReportedTarget = async (req, res, next) => {
  try {
    const report = await administratorService.deleteReportedTarget(
      req.params.reportId,
      req.user.roleId,
      readBodyText(req.body, ['resolutionNote', 'comment']),
    );

    return success(res, 200, 'Contenu signale supprime.', report);
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
      req.body || {},
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
      req.body || {},
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

exports.listBadges = async (req, res, next) => {
  try {
    const data = await administratorService.listBadges({
      search: req.query.search?.trim(),
      page: parsePositiveInt(req.query.page, 1),
      limit: parsePositiveInt(req.query.limit, 10),
    });

    return success(res, 200, 'Badges recuperes.', data);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.createBadge = async (req, res, next) => {
  try {
    const badge = await administratorService.createBadge(req.body || {});
    return success(res, 201, 'Badge cree.', badge);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.updateBadge = async (req, res, next) => {
  try {
    const badge = await administratorService.updateBadge(req.params.badgeId, req.body || {});
    return success(res, 200, 'Badge mis a jour.', badge);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.deleteBadge = async (req, res, next) => {
  try {
    const result = await administratorService.deleteBadge(req.params.badgeId);
    return success(res, 200, 'Badge supprime.', result);
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
      readBodyText(req.body, ['reason']),
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

    const user = await administratorService.updateUserRole(req.params.userId, role, req.body, req.user.userId);
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
    const request = await administratorService.approveProfessionalRequest(req.params.userId, req.user.roleId);

    return success(res, 200, 'Demande professionnelle approuvee.', request);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};

exports.rejectProfessionalRequest = async (req, res, next) => {
  try {
    const request = await administratorService.rejectProfessionalRequest(
      req.params.userId,
      req.user.roleId,
      readBodyText(req.body, ['rejectionReason']),
    );

    return success(res, 200, 'Demande professionnelle rejetee.', request);
  } catch (err) {
    if (handleAdminError(res, err)) return;
    next(err);
  }
};
