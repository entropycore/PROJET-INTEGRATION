'use strict';

const prisma = require('../config/prisma');
const notificationService = require('./notificationService');

const REPORT_TARGET_TYPES = ['PORTFOLIO', 'COMMENT', 'RECOMMENDATION', 'PROJECT', 'INTERNSHIP', 'USER', 'OTHER'];

const reportCreateSelect = {
  id: true,
  targetType: true,
  targetId: true,
  reason: true,
  description: true,
  status: true,
  createdAt: true,
  reporterUser: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
};

const formatFullName = (user) => `${user.firstName} ${user.lastName}`.trim();

const ensureValidTargetType = (targetType) => {
  if (!REPORT_TARGET_TYPES.includes(targetType)) {
    throw new Error('INVALID_REPORT_TARGET_TYPE');
  }
};

const ensureTargetIdIfNeeded = (targetType, targetId) => {
  if (targetType !== 'OTHER' && !targetId) {
    throw new Error('REPORT_TARGET_ID_REQUIRED');
  }
};

const checkTargetExists = async (targetType, targetId) => {
  if (targetType === 'OTHER') {
    return true;
  }

  const readers = {
    PORTFOLIO: () => prisma.portfolio.findUnique({ where: { id: targetId }, select: { id: true } }),
    COMMENT: () => prisma.comment.findUnique({ where: { id: targetId }, select: { id: true } }),
    RECOMMENDATION: () =>
      prisma.recommendation.findUnique({ where: { id: targetId }, select: { id: true } }),
    PROJECT: () => prisma.project.findUnique({ where: { id: targetId }, select: { id: true } }),
    INTERNSHIP: () => prisma.internship.findUnique({ where: { id: targetId }, select: { id: true } }),
    USER: () => prisma.user.findUnique({ where: { id: targetId }, select: { id: true } }),
  };

  const target = await readers[targetType]();
  if (!target) {
    throw new Error('REPORT_TARGET_NOT_FOUND');
  }
};

const ensureNoDuplicatePendingReport = async (reporterUserId, targetType, targetId) => {
  if (!targetId) {
    return;
  }

  const existing = await prisma.report.findFirst({
    where: {
      reporterUserId,
      targetType,
      targetId,
      status: 'PENDING',
    },
    select: { id: true },
  });

  if (existing) {
    throw new Error('REPORT_ALREADY_EXISTS');
  }
};

const mapCreatedReport = (report) => ({
  id: report.id,
  type: 'REPORT',
  status: report.status,
  createdAt: report.createdAt,
  reason: report.reason,
  description: report.description,
  targetType: report.targetType,
  targetId: report.targetId,
  reporter: report.reporterUser
    ? {
        id: report.reporterUser.id,
        firstName: report.reporterUser.firstName,
        lastName: report.reporterUser.lastName,
        fullName: formatFullName(report.reporterUser),
        email: report.reporterUser.email,
      }
    : null,
});

exports.createReport = async ({ reporterUserId, targetType, targetId, reason, description }) => {
  const normalizedTargetType = String(targetType || '').trim().toUpperCase().replace(/-/g, '_');
  const normalizedTargetId = typeof targetId === 'string' ? targetId.trim() || null : null;
  const normalizedReason = String(reason || '').trim();
  const normalizedDescription = typeof description === 'string' ? description.trim() || null : null;

  ensureValidTargetType(normalizedTargetType);
  ensureTargetIdIfNeeded(normalizedTargetType, normalizedTargetId);
  await checkTargetExists(normalizedTargetType, normalizedTargetId);
  await ensureNoDuplicatePendingReport(reporterUserId, normalizedTargetType, normalizedTargetId);

  const report = await prisma.report.create({
    data: {
      reporterUserId,
      targetType: normalizedTargetType,
      targetId: normalizedTargetId,
      reason: normalizedReason,
      description: normalizedDescription,
      status: 'PENDING',
    },
    select: reportCreateSelect,
  });

  await notificationService.ensurePendingItemNotification({
    id: report.id,
    type: 'REPORT',
    requesterName: report.reporterUser ? formatFullName(report.reporterUser) : 'Utilisateur inconnu',
    status: report.status,
  });

  return mapCreatedReport(report);
};
