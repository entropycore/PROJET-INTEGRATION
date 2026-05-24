'use strict';

const prisma = require('../../config/prisma');
const notificationService = require('../notificationService');
const { mapReportItem } = require('./mappers');
const { reportSelect } = require('./serviceSelects');
const {
  paginateItems,
  readTextValue,
  safeCount,
  safeReadWithFallback,
} = require('./serviceUtils');

const REPORT_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];
const REPORT_TARGET_TYPES = ['PORTFOLIO', 'COMMENT', 'RECOMMENDATION', 'PROJECT', 'INTERNSHIP', 'USER', 'OTHER'];
const DELETABLE_REPORT_TARGET_TYPES = new Set(['PORTFOLIO', 'COMMENT', 'RECOMMENDATION', 'PROJECT', 'INTERNSHIP']);

const ensureValidReportStatus = (status) => {
  if (!REPORT_STATUSES.includes(status)) {
    throw new Error('INVALID_REPORT_STATUS');
  }
};

const ensureValidReportTargetType = (targetType) => {
  if (!REPORT_TARGET_TYPES.includes(targetType)) {
    throw new Error('UNSUPPORTED_REPORT_TARGET_TYPE');
  }
};

const deleteReportTargetRecord = async (tx, report) => {
  if (!DELETABLE_REPORT_TARGET_TYPES.has(report.targetType)) {
    return 'resolved_without_target_deletion';
  }

  try {
    switch (report.targetType) {
      case 'PORTFOLIO':
        if (!report.targetId) throw new Error('REPORT_TARGET_NOT_FOUND');
        await tx.portfolio.delete({ where: { id: report.targetId } });
        return 'deleted';

      case 'COMMENT':
        if (!report.targetId) throw new Error('REPORT_TARGET_NOT_FOUND');
        await tx.comment.delete({ where: { id: report.targetId } });
        return 'deleted';

      case 'RECOMMENDATION':
        if (!report.targetId) throw new Error('REPORT_TARGET_NOT_FOUND');
        await tx.recommendation.delete({ where: { id: report.targetId } });
        return 'deleted';

      case 'PROJECT':
        if (!report.targetId) throw new Error('REPORT_TARGET_NOT_FOUND');
        await tx.project.delete({ where: { id: report.targetId } });
        return 'deleted';

      case 'INTERNSHIP':
        if (!report.targetId) throw new Error('REPORT_TARGET_NOT_FOUND');
        await tx.internship.delete({ where: { id: report.targetId } });
        return 'deleted';

      default:
        return 'resolved_without_target_deletion';
    }
  } catch (err) {
    if (err?.code === 'P2025') {
      throw new Error('REPORT_TARGET_NOT_FOUND', { cause: err });
    }

    throw err;
  }
};

const getReportOrThrow = async (reportId) => {
  const report = await safeReadWithFallback(
    () =>
      prisma.report.findUnique({
        where: { id: reportId },
        select: reportSelect,
      }),
    null,
    null,
  );

  if (!report) {
    throw new Error('REPORT_NOT_FOUND');
  }

  return report;
};

const loadReportItems = async (status, targetType) =>
  safeReadWithFallback(
    () =>
      prisma.report.findMany({
        where: {
          ...(status ? { status } : {}),
          ...(targetType ? { targetType } : {}),
        },
        orderBy: [{ createdAt: 'desc' }],
        take: 100,
        select: reportSelect,
      }),
    null,
    [],
  );

const matchesReportSearch = (report, search) => {
  const normalizedSearch = String(search || '').trim().toLowerCase();
  if (!normalizedSearch) return true;

  const values = [
    report.requesterName,
    report.email,
    report.label,
    report.organization,
    report.raw?.reason,
    report.raw?.description,
    report.raw?.targetType,
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  return values.some((value) => value.includes(normalizedSearch));
};

const syncPendingReportNotifications = async () => {
  const reports = await loadReportItems('PENDING', null);
  await Promise.all(reports.map((report) => notificationService.ensurePendingItemNotification(mapReportItem(report))));
};

const listReports = async ({ status = 'PENDING', targetType, page = 1, limit = 10, search } = {}) => {
  await syncPendingReportNotifications();

  const normalizedTargetType = targetType ? String(targetType).trim().toUpperCase().replace(/-/g, '_') : null;
  const normalizedStatus = status ? String(status).trim().toUpperCase() : null;

  if (normalizedStatus) {
    ensureValidReportStatus(normalizedStatus);
  }

  if (normalizedTargetType) {
    ensureValidReportTargetType(normalizedTargetType);
  }

  const reports = await loadReportItems(normalizedStatus, normalizedTargetType);
  const filteredReports = reports.map(mapReportItem).filter((item) => matchesReportSearch(item, search));
  const paginated = paginateItems(filteredReports, page, limit);

  return {
    filters: {
      status: normalizedStatus,
      targetType: normalizedTargetType,
      search: search || null,
    },
    ...paginated,
  };
};

const getPendingReportsCount = async () =>
  safeCount(() =>
    prisma.report.count({
      where: { status: 'PENDING' },
    }),
  );

const getReportById = async (reportId) => mapReportItem(await getReportOrThrow(reportId));

const approveReport = async (reportId, administratorId, resolutionNote = null) => {
  const report = await getReportOrThrow(reportId);
  if (report.status !== 'PENDING') {
    throw new Error('REPORT_INVALID_STATE');
  }

  await prisma.report.update({
    where: { id: reportId },
    data: {
      status: 'APPROVED',
      reviewedByAdministratorId: administratorId,
      reviewedAt: new Date(),
      resolutionNote,
    },
  });

  const updatedReport = await getReportById(reportId);
  await notificationService.createAdminActionNotification({
    title: 'Signalement approuve',
    message: `Le signalement lié à ${report.targetType.toLowerCase()} a été approuvé.`,
    relatedType: 'REPORT',
    relatedId: reportId,
  });

  return updatedReport;
};

const resolveReportLegacy = async (reportId, administratorId, resolutionNote = null) =>
  approveReport(reportId, administratorId, resolutionNote || 'Signalement marqué comme traité.');

const rejectReport = async (reportId, administratorId, resolutionNote = null) => {
  const report = await getReportOrThrow(reportId);
  if (report.status !== 'PENDING') {
    throw new Error('REPORT_INVALID_STATE');
  }

  await prisma.report.update({
    where: { id: reportId },
    data: {
      status: 'REJECTED',
      reviewedByAdministratorId: administratorId,
      reviewedAt: new Date(),
      resolutionNote,
    },
  });

  const updatedReport = await getReportById(reportId);
  await notificationService.createAdminActionNotification({
    title: 'Signalement rejete',
    message: `Le signalement lié à ${report.targetType.toLowerCase()} a été rejeté.`,
    relatedType: 'REPORT',
    relatedId: reportId,
  });

  return updatedReport;
};

const deleteReportedTarget = async (reportId, administratorId, resolutionNote = null) => {
  const report = await getReportOrThrow(reportId);
  if (report.status !== 'PENDING') {
    throw new Error('REPORT_INVALID_STATE');
  }

  const reviewedAt = new Date();
  let deletionOutcome = 'resolved_without_target_deletion';
  let appliedResolutionNote = resolutionNote;

  await prisma.$transaction(async (tx) => {
    deletionOutcome = await deleteReportTargetRecord(tx, report);

    if (!appliedResolutionNote) {
      appliedResolutionNote =
        deletionOutcome === 'deleted'
          ? 'Contenu signalé supprimé.'
          : 'Signalement traité sans suppression automatique de la cible.';
    }

    await tx.report.update({
      where: { id: reportId },
      data: {
        status: 'APPROVED',
        reviewedByAdministratorId: administratorId,
        reviewedAt,
        resolutionNote: appliedResolutionNote,
      },
    });
  });

  const updatedReport = await getReportById(reportId);
  await notificationService.createAdminActionNotification({
    title: deletionOutcome === 'deleted' ? 'Contenu signalé supprimé' : 'Signalement traité',
    message:
      deletionOutcome === 'deleted'
        ? `Le contenu signalé lié à ${report.targetType.toLowerCase()} a été supprimé.`
        : `Le signalement lié à ${report.targetType.toLowerCase()} a été traité sans suppression automatique de la cible.`,
    relatedType: 'REPORT',
    relatedId: reportId,
  });

  return updatedReport;
};

module.exports = {
  approveReport,
  deleteReportedTarget,
  getPendingReportsCount,
  getReportById,
  listReports,
  loadReportItems,
  readTextValue,
  rejectReport,
  resolveReportLegacy,
  syncPendingReportNotifications,
};
