'use strict';

const { formatFullName } = require('./userMappers');

const mapReportItem = (report) => {
  const reporter = report.reporterUser;
  const reviewer = report.reviewedByAdministrator?.user || null;
  const reporterFullName = reporter ? formatFullName(reporter) : 'Utilisateur inconnu';
  const displayStatus = report.status === 'APPROVED' ? 'RESOLVED' : report.status;

  return {
    id: report.id,
    type: 'REPORT',
    label: 'Report',
    requesterName: reporterFullName,
    email: reporter?.email || null,
    organization: null,
    createdAt: report.createdAt,
    tone: 'red',
    status: displayStatus,
    targetType: report.targetType,
    targetId: report.targetId,
    reason: report.reason,
    description: report.description,
    reviewedAt: report.reviewedAt,
    resolutionNote: report.resolutionNote,
    reportedBy: {
      id: reporter?.id || null,
      fullName: reporterFullName,
      email: reporter?.email || null,
      phone: reporter?.phone || null,
      profilePicture: reporter?.profilePicture || null,
    },
    reviewedBy: reviewer
      ? {
          id: reviewer.id,
          fullName: formatFullName(reviewer),
          email: reviewer.email || null,
        }
      : null,
    raw: {
      status: report.status,
      targetType: report.targetType,
      targetId: report.targetId,
      reason: report.reason,
      description: report.description,
      reviewedAt: report.reviewedAt,
      resolutionNote: report.resolutionNote,
      reporterUser: reporter,
      reviewerName: reviewer ? formatFullName(reviewer) : null,
      reviewerUser: reviewer,
    },
  };
};


module.exports = {
  mapReportItem,
};
