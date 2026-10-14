'use strict';

const prisma = require('../../config/prisma');
const {
  mapCertificateRequestDetail,
  mapDashboardAccessRequest,
  mapDashboardCertificateRequest,
  mapReportItem,
} = require('./mappers');
const adminNotificationService = require('./adminNotificationService');
const professionalRequestService = require('./professionalRequestService');
const reportService = require('./reportService');
const validationService = require('./validationService');
const { getRecentCertificateRequests } = require('./validationData');
const { readTextValue, safeCount } = require('./serviceUtils');

const getRecentDashboardRequests = async () => {
  const [professionalRequests, certificateRequests, reports] = await Promise.all([
    professionalRequestService.getRecentProfessionalRequests(),
    getRecentCertificateRequests(),
    reportService.loadReportItems('PENDING', null),
  ]);

  return [
    ...professionalRequests.map(mapDashboardAccessRequest),
    ...certificateRequests.map(mapDashboardCertificateRequest),
    ...reports.slice(0, 5).map(mapReportItem),
  ]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 5);
};

const getDashboardData = async () => {
  await adminNotificationService.syncAdminNotifications();

  const [
    totalUsers,
    totalStudents,
    totalProfessors,
    pendingRequests,
    pendingValidationCounts,
    pendingReports,
    recentRequests,
  ] = await Promise.all([
    safeCount(() => prisma.user.count()),
    safeCount(() => prisma.user.count({ where: { role: 'STUDENT' } })),
    safeCount(() => prisma.user.count({ where: { role: 'PROFESSOR' } })),
    safeCount(() =>
      prisma.user.count({
        where: {
          role: 'PROFESSIONAL',
          accountStatus: 'PENDING',
        },
      }),
    ),
    validationService.getPendingValidationCounts(),
    safeCount(() => prisma.report.count({ where: { status: 'PENDING' } })),
    getRecentDashboardRequests(),
  ]);

  return {
    summaryCards: {
      totalUsers: { value: totalUsers, variation: 'Comptes enregistrés' },
      totalStudents: { value: totalStudents, variation: 'Profils étudiants' },
      totalProfessors: { value: totalProfessors, variation: 'Profils professeurs' },
      pendingRequests: {
        value: pendingRequests,
        variation: 'Demandes professionnelles',
      },
    },
    urgentActions: {
      pendingAccessRequests: pendingRequests,
      pendingValidations: pendingValidationCounts.total,
      reports: pendingReports,
    },
    recentRequests,
  };
};

const getDashboardItemDetail = async (itemType, itemId) => {
  const type = String(itemType || '').trim().toUpperCase().replace(/-/g, '_');

  switch (type) {
    case 'ACCESS_REQUEST':
      return professionalRequestService.getProfessionalRequest(itemId);
    case 'CERTIFICATE_VALIDATION':
      return mapCertificateRequestDetail(await validationService.getCertificateRequestOrThrow(itemId));
    case 'REPORT':
      return reportService.getReportById(itemId);
    default:
      throw new Error('UNSUPPORTED_DASHBOARD_ITEM_TYPE');
  }
};

const approveDashboardItem = async (itemType, itemId, administratorId, payload = {}) => {
  const type = String(itemType || '').trim().toUpperCase().replace(/-/g, '_');

  switch (type) {
    case 'ACCESS_REQUEST':
      return professionalRequestService.approveProfessionalRequest(itemId, administratorId);
    case 'CERTIFICATE_VALIDATION':
      return validationService.createCertificateValidation(
        itemId,
        administratorId,
        'APPROVED',
        readTextValue(payload, ['comment']),
      );
    case 'REPORT':
      return reportService.approveReport(
        itemId,
        administratorId,
        readTextValue(payload, ['resolutionNote', 'comment']),
      );
    default:
      throw new Error('UNSUPPORTED_DASHBOARD_ACTION_TYPE');
  }
};

const rejectDashboardItem = async (itemType, itemId, administratorId, payload = {}) => {
  const type = String(itemType || '').trim().toUpperCase().replace(/-/g, '_');
  const comment = readTextValue(payload, ['comment', 'rejectionReason', 'reason']);

  switch (type) {
    case 'ACCESS_REQUEST':
      return professionalRequestService.rejectProfessionalRequest(itemId, administratorId, comment);
    case 'CERTIFICATE_VALIDATION':
      return validationService.createCertificateValidation(itemId, administratorId, 'REJECTED', comment);
    case 'REPORT':
      return reportService.rejectReport(itemId, administratorId, comment);
    default:
      throw new Error('UNSUPPORTED_DASHBOARD_ACTION_TYPE');
  }
};

module.exports = {
  approveDashboardItem,
  getDashboardData,
  getDashboardItemDetail,
  rejectDashboardItem,
};
