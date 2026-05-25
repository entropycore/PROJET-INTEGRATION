'use strict';

const formatFullName = (user) => `${user.firstName} ${user.lastName}`.trim();

const normalizeProfessionalData = (professional) => {
  if (!professional) {
    return null;
  }

  return {
    emailVerifiedAt: null,
    approvedAt: null,
    approvedByAdministratorId: null,
    rejectedAt: null,
    rejectedByAdministratorId: null,
    rejectionReason: null,
    suspendedAt: null,
    suspendedByAdministratorId: null,
    suspensionReason: null,
    ...professional,
  };
};

const getEmailVerifiedValue = (user) => {
  if (user.role === 'PROFESSIONAL') {
    return Boolean(user.professional?.isEmailVerified);
  }

  return true;
};

const mapUserSummary = (user) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  fullName: formatFullName(user),
  email: user.email,
  phone: user.phone,
  profilePicture: user.profilePicture,
  role: user.role,
  accountStatus: user.accountStatus,
  createdAt: user.createdAt,
  lastLoginAt: user.lastLoginAt,
  emailVerified: getEmailVerifiedValue(user),
  roleDetails: {
    student: user.student,
    professor: user.professor,
    administrator: user.administrator,
    professional: normalizeProfessionalData(user.professional),
  },
});

const mapProfessionalRequestDetail = (user) => {
  const professional = normalizeProfessionalData(user.professional);

  return {
    id: user.id,
    requesterName: formatFullName(user),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    profilePicture: user.profilePicture,
    accountStatus: user.accountStatus,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    organization: professional?.company || null,
    type: 'ACCESS_REQUEST',
    label: "Demande d'acces",
    tone: user.accountStatus === 'PENDING' ? 'orange' : 'green',
    professional,
  };
};

const mapDashboardAccessRequest = (user) => {
  const professional = normalizeProfessionalData(user.professional);

  return {
    id: user.id,
    type: 'ACCESS_REQUEST',
    label: "Demande d'acces",
    requesterName: formatFullName(user),
    email: user.email,
    organization: professional?.company || null,
    createdAt: user.createdAt,
    tone: user.accountStatus === 'PENDING' ? 'orange' : 'green',
    status: user.accountStatus,
    raw: {
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      profilePicture: user.profilePicture,
      lastLoginAt: user.lastLoginAt,
      accountStatus: user.accountStatus,
      professional,
    },
  };
};

const mapDashboardCertificateRequest = (certificate) => {
  const requester = certificate.activity?.student?.user;

  return {
    id: certificate.id,
    type: 'CERTIFICATE_VALIDATION',
    label: 'Certificate validation',
    requesterName: requester ? formatFullName(requester) : 'Etudiant inconnu',
    email: requester?.email || null,
    organization: certificate.activity?.organization || null,
    createdAt: certificate.submittedAt,
    tone: 'green',
    status: certificate.validationStatus,
    raw: {
      certificateId: certificate.id,
      documentUrl: certificate.documentUrl,
      submittedAt: certificate.submittedAt,
      activityId: certificate.activity?.id || null,
      activityTitle: certificate.activity?.title || null,
      studentId: certificate.activity?.student?.id || null,
    },
  };
};

const toFullName = (user) => (user ? formatFullName(user) : null);

const mapFrontendStudent = (student) => {
  const user = student?.user;

  return {
    id: student?.id || null,
    userId: user?.id || null,
    fullName: toFullName(user) || 'Etudiant inconnu',
    email: user?.email || null,
    phone: user?.phone || null,
    profilePicture: user?.profilePicture || null,
    apogeeCode: student?.apogeeCode || null,
    cne: student?.cne || null,
    major: student?.major || null,
    level: student?.level || null,
    city: student?.city || null,
  };
};

const mapFrontendAuthor = (user, organization = null, role = null) => ({
  id: user?.id || null,
  fullName: toFullName(user) || 'Utilisateur inconnu',
  email: user?.email || null,
  phone: user?.phone || null,
  profilePicture: user?.profilePicture || null,
  organization,
  role,
});

const toFrontendReportStatus = (status) => (status === 'APPROVED' ? 'RESOLVED' : status);
const toDatabaseReportStatus = (status) => {
  if (!status) return null;
  const normalized = String(status).trim().toUpperCase().replace(/-/g, '_');
  if (normalized === 'ALL') return null;
  if (normalized === 'RESOLVED') return 'APPROVED';
  return normalized;
};

const mapCertificateRequestDetail = (certificate) => {
  const requester = certificate.activity?.student?.user;
  const student = certificate.activity?.student || null;

  return {
    id: certificate.id,
    type: 'CERTIFICATE_VALIDATION',
    targetType: 'CERTIFICATE',
    targetId: certificate.id,
    title: certificate.activity?.title || certificate.fileName || 'Certificat',
    description: certificate.activity?.description || certificate.fileName || null,
    student: mapFrontendStudent(student),
    submittedAt: certificate.submittedAt,
    targetDetails: {
      certificateId: certificate.id,
      documentUrl: certificate.documentUrl,
      fileName: certificate.fileName || null,
      mimeType: certificate.mimeType || null,
      fileSize: certificate.fileSize || null,
      storagePath: certificate.storagePath || null,
      activityId: certificate.activity?.id || null,
      activityTitle: certificate.activity?.title || null,
      activityType: certificate.activity?.type || null,
      organization: certificate.activity?.organization || null,
      startDate: certificate.activity?.startDate || null,
      endDate: certificate.activity?.endDate || null,
    },
    label: 'Certificate validation',
    requesterName: requester ? formatFullName(requester) : 'Etudiant inconnu',
    email: requester?.email || null,
    organization: certificate.activity?.organization || null,
    createdAt: certificate.submittedAt,
    tone: 'green',
    status: certificate.validationStatus,
    raw: {
      certificateId: certificate.id,
      documentUrl: certificate.documentUrl,
      submittedAt: certificate.submittedAt,
      activity: certificate.activity
        ? {
            id: certificate.activity.id,
            title: certificate.activity.title,
            description: certificate.activity.description || null,
            type: certificate.activity.type || null,
            organization: certificate.activity.organization || null,
            startDate: certificate.activity.startDate || null,
            endDate: certificate.activity.endDate || null,
          }
        : null,
      student: certificate.activity?.student
        ? {
            id: certificate.activity.student.id,
            apogeeCode: certificate.activity.student.apogeeCode || null,
            cne: certificate.activity.student.cne || null,
            major: certificate.activity.student.major,
            level: certificate.activity.student.level,
            city: certificate.activity.student.city || null,
            user: requester
              ? {
                  id: requester.id,
                  firstName: requester.firstName,
                  lastName: requester.lastName,
                  email: requester.email,
                  phone: requester.phone || null,
                  profilePicture: requester.profilePicture || null,
                }
              : null,
          }
        : null,
    },
  };
};

const mapRecommendationLetterValidationItem = (letter) => {
  const studentUser = letter.student?.user;
  const authorUser = letter.authorUser;

  return {
    id: letter.id,
    type: 'RECOMMENDATION_LETTER_VALIDATION',
    targetType: 'RECOMMENDATION_LETTER',
    targetId: letter.id,
    title: letter.title,
    description: letter.content,
    student: mapFrontendStudent(letter.student),
    submittedAt: letter.createdAt,
    targetDetails: {
      title: letter.title,
      content: letter.content,
      type: letter.type,
      documentUrl: letter.documentUrl,
      author: mapFrontendAuthor(authorUser),
      validatedAt: letter.validatedAt,
      rejectionReason: letter.rejectionReason,
    },
    label: 'Recommendation letter validation',
    requesterName: studentUser ? formatFullName(studentUser) : 'Etudiant inconnu',
    email: studentUser?.email || null,
    organization: null,
    createdAt: letter.createdAt,
    tone: 'green',
    status: letter.validationStatus,
    raw: {
      title: letter.title,
      content: letter.content,
      letterType: letter.type,
      documentUrl: letter.documentUrl,
      validatedAt: letter.validatedAt,
      rejectionReason: letter.rejectionReason,
      authorName: authorUser ? formatFullName(authorUser) : null,
      authorUser,
      studentName: studentUser ? formatFullName(studentUser) : null,
      student: letter.student,
      validatorUser: letter.validatorUser,
    },
  };
};

const mapCommentValidationItem = (comment) => {
  const authorUser = comment.authorUser;
  const studentUser = comment.portfolio?.student?.user;

  return {
    id: comment.id,
    type: 'COMMENT_VALIDATION',
    targetType: 'COMMENT',
    targetId: comment.id,
    title: comment.portfolio?.title || 'Commentaire',
    description: comment.content,
    student: mapFrontendStudent(comment.portfolio?.student),
    submittedAt: comment.createdAt,
    targetDetails: {
      content: comment.content,
      targetType: comment.targetType,
      targetId: comment.targetId,
      portfolioTitle: comment.portfolio?.title || null,
      portfolioSlug: comment.portfolio?.publicSlug || null,
      author: mapFrontendAuthor(authorUser),
      validatedAt: comment.validatedAt,
      rejectionReason: comment.rejectionReason,
    },
    label: 'Comment validation',
    requesterName: authorUser ? formatFullName(authorUser) : 'Auteur inconnu',
    email: authorUser?.email || null,
    organization: null,
    createdAt: comment.createdAt,
    tone: 'green',
    status: comment.status,
    raw: {
      title: comment.portfolio?.title || null,
      content: comment.content,
      targetType: comment.targetType,
      targetId: comment.targetId,
      validatedAt: comment.validatedAt,
      rejectionReason: comment.rejectionReason,
      authorName: authorUser ? formatFullName(authorUser) : null,
      authorUser,
      studentName: studentUser ? formatFullName(studentUser) : null,
      portfolioTitle: comment.portfolio?.title || null,
      portfolio: comment.portfolio,
      validatorUser: comment.validatorUser,
    },
  };
};

const mapRecommendationValidationItem = (recommendation) => {
  const authorUser = recommendation.authorUser;
  const studentUser = recommendation.student?.user;

  return {
    id: recommendation.id,
    type: 'RECOMMENDATION_VALIDATION',
    targetType: 'RECOMMENDATION',
    targetId: recommendation.id,
    title: recommendation.title,
    description: recommendation.content,
    student: mapFrontendStudent(recommendation.student),
    submittedAt: recommendation.createdAt,
    targetDetails: {
      title: recommendation.title,
      content: recommendation.content,
      organization: recommendation.organization || null,
      authorJobTitle: recommendation.authorJobTitle || null,
      recommendationType: recommendation.recommendationType || null,
      portfolioTitle: recommendation.portfolio?.title || null,
      author: mapFrontendAuthor(authorUser, recommendation.organization, recommendation.authorJobTitle),
      validatedAt: recommendation.validatedAt,
      rejectionReason: recommendation.rejectionReason,
    },
    label: 'Recommendation validation',
    requesterName: authorUser ? formatFullName(authorUser) : 'Auteur inconnu',
    email: authorUser?.email || null,
    organization: recommendation.organization || null,
    createdAt: recommendation.createdAt,
    tone: 'green',
    status: recommendation.status,
    raw: {
      title: recommendation.title,
      content: recommendation.content,
      authorJobTitle: recommendation.authorJobTitle,
      recommendationType: recommendation.recommendationType,
      validatedAt: recommendation.validatedAt,
      rejectionReason: recommendation.rejectionReason,
      authorName: authorUser ? formatFullName(authorUser) : null,
      authorUser,
      studentName: studentUser ? formatFullName(studentUser) : null,
      student: recommendation.student,
      portfolioTitle: recommendation.portfolio?.title || null,
      portfolio: recommendation.portfolio,
      validatorUser: recommendation.validatorUser,
    },
  };
};

const mapReportItem = (report) => {
  const reporter = report.reporterUser;
  const reviewer = report.reviewedByAdministrator?.user || null;
  const frontendStatus = toFrontendReportStatus(report.status);

  return {
    id: report.id,
    type: 'REPORT',
    targetType: report.targetType,
    targetId: report.targetId,
    reason: report.reason,
    description: report.description,
    reportedBy: mapFrontendAuthor(reporter),
    reviewedBy: reviewer ? mapFrontendAuthor(reviewer) : null,
    label: 'Report',
    requesterName: reporter ? formatFullName(reporter) : 'Utilisateur inconnu',
    email: reporter?.email || null,
    organization: null,
    createdAt: report.createdAt,
    tone: 'red',
    status: frontendStatus,
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
  formatFullName,
  normalizeProfessionalData,
  getEmailVerifiedValue,
  mapUserSummary,
  mapProfessionalRequestDetail,
  mapDashboardAccessRequest,
  mapDashboardCertificateRequest,
  toFullName,
  mapFrontendStudent,
  mapFrontendAuthor,
  toFrontendReportStatus,
  toDatabaseReportStatus,
  mapCertificateRequestDetail,
  mapRecommendationLetterValidationItem,
  mapCommentValidationItem,
  mapRecommendationValidationItem,
  mapReportItem,
};
