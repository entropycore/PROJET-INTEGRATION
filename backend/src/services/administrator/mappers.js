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
    label: "Demande d'accès",
    tone: user.accountStatus === 'PENDING' ? 'orange' : 'green',
    professional,
  };
};

const mapDashboardAccessRequest = (user) => {
  const professional = normalizeProfessionalData(user.professional);

  return {
    id: user.id,
    type: 'ACCESS_REQUEST',
    label: "Demande d'accès",
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
    requesterName: requester ? formatFullName(requester) : 'Étudiant inconnu',
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

const mapCertificateRequestDetail = (certificate) => {
  const requester = certificate.activity?.student?.user;

  return {
    id: certificate.id,
    type: 'CERTIFICATE_VALIDATION',
    label: 'Certificate validation',
    requesterName: requester ? formatFullName(requester) : 'Étudiant inconnu',
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
    label: 'Recommendation letter validation',
    requesterName: studentUser ? formatFullName(studentUser) : 'Étudiant inconnu',
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

const extractFileNameFromUrl = (url, fallbackName) => {
  if (!url) {
    return fallbackName;
  }

  try {
    const pathname = new URL(url).pathname;
    const fileName = pathname.split('/').filter(Boolean).pop();
    return fileName || fallbackName;
  } catch {
    const fileName = String(url).split('/').filter(Boolean).pop();
    return fileName || fallbackName;
  }
};

const buildLegacyValidationStudent = (student, user, fallbackName, fallbackEmail = null) => ({
  id: student?.id || null,
  fullName: user ? formatFullName(user) : fallbackName || 'Utilisateur inconnu',
  email: user?.email || fallbackEmail || null,
  profilePicture: user?.profilePicture || null,
  field: student?.major || null,
  level: student?.level || null,
  city: student?.city || null,
});

const buildLegacyValidationFiles = (url, fallbackName) =>
  url
    ? [
        {
          id: url,
          name: extractFileNameFromUrl(url, fallbackName),
          size: null,
          url,
        },
      ]
    : [];

const buildLegacyValidationMediaFiles = (media = []) =>
  Array.isArray(media)
    ? media
        .filter((item) => item?.mediaUrl)
        .map((item, index) => ({
          id: item.id || item.mediaUrl || `project-media-${index + 1}`,
          name: extractFileNameFromUrl(
            item.mediaUrl,
            item.mediaType ? `${String(item.mediaType).toLowerCase()}-${index + 1}` : `media-${index + 1}`,
          ),
          size: null,
          url: item.mediaUrl,
        }))
    : [];

const formatTechnologyLabel = (technology) =>
  technology?.version ? `${technology.name} ${technology.version}` : technology?.name || null;

const mapProjectValidationItem = (project) => {
  const studentUser = project.student?.user;

  return {
    id: project.id,
    type: 'PROJECT',
    label: 'Project validation',
    requesterName: studentUser ? formatFullName(studentUser) : 'Étudiant inconnu',
    email: studentUser?.email || null,
    organization: null,
    createdAt: project.submittedAt || project.createdAt,
    tone: 'green',
    status: project.validationStatus,
    raw: {
      title: project.title,
      description: project.description,
      projectType: project.type,
      teamRole: project.teamRole,
      githubUrl: project.githubUrl,
      youtubeUrl: project.youtubeUrl,
      result: project.result,
      generalFeedback: project.generalFeedback,
      submittedAt: project.submittedAt,
      createdAt: project.createdAt,
      visibility: project.visibility,
      student: project.student,
      technologies: project.technologies,
      media: project.media,
    },
  };
};

const mapInternshipValidationItem = (internship) => {
  const studentUser = internship.student?.user;

  return {
    id: internship.id,
    type: 'INTERNSHIP',
    label: 'Internship validation',
    requesterName: studentUser ? formatFullName(studentUser) : 'Étudiant inconnu',
    email: studentUser?.email || null,
    organization: internship.hostOrganization || null,
    createdAt: internship.startDate || internship.endDate || null,
    tone: 'green',
    status: internship.validationStatus,
    raw: {
      title: internship.hostOrganization ? `Stage - ${internship.hostOrganization}` : 'Stage',
      description: internship.missions || null,
      hostOrganization: internship.hostOrganization,
      duration: internship.duration,
      startDate: internship.startDate,
      endDate: internship.endDate,
      missions: internship.missions,
      reportUrl: internship.reportUrl,
      visibility: internship.visibility,
      student: internship.student,
      supervisorProfessor: internship.supervisorProfessor,
      technologies: internship.technologies,
    },
  };
};

const mapValidationItemToLegacyShape = (item) => {
  switch (item.type) {
    case 'PROJECT': {
      const student = item.raw?.student || null;
      const studentUser = student?.user || null;
      const title = item.raw?.title || 'Projet';

      return {
        id: item.id,
        itemType: item.type,
        targetType: 'PROJECT',
        targetId: item.id,
        title,
        student: buildLegacyValidationStudent(student, studentUser, item.requesterName, item.email),
        status: item.status,
        submittedAt: item.raw?.submittedAt || item.createdAt,
        description: item.raw?.description || 'Projet soumis pour validation.',
        content: {
          title,
          description: item.raw?.description || null,
          files: buildLegacyValidationMediaFiles(item.raw?.media),
        },
        targetDetails: {
          technologies: (item.raw?.technologies || [])
            .map((entry) => formatTechnologyLabel(entry.technology))
            .filter(Boolean),
          visibility: item.raw?.visibility || null,
          createdAt: item.raw?.createdAt || null,
        },
        raw: item.raw,
      };
    }

    case 'INTERNSHIP': {
      const student = item.raw?.student || null;
      const studentUser = student?.user || null;
      const title = item.raw?.title || 'Stage';

      return {
        id: item.id,
        itemType: item.type,
        targetType: 'INTERNSHIP',
        targetId: item.id,
        title,
        student: buildLegacyValidationStudent(student, studentUser, item.requesterName, item.email),
        status: item.status,
        submittedAt: item.raw?.startDate || item.createdAt,
        description: item.raw?.description || item.raw?.missions || 'Stage soumis pour validation.',
        content: {
          title,
          description: item.raw?.missions || item.raw?.description || null,
          files: buildLegacyValidationFiles(item.raw?.reportUrl, 'rapport-stage'),
        },
        targetDetails: {
          company: item.raw?.hostOrganization || item.organization || null,
          startDate: item.raw?.startDate || null,
          endDate: item.raw?.endDate || null,
        },
        raw: item.raw,
      };
    }

    case 'CERTIFICATE_VALIDATION': {
      const student = item.raw?.student || null;
      const studentUser = student?.user || null;
      const activity = item.raw?.activity || null;
      const certificateId = item.raw?.certificateId || item.id;

      return {
        id: item.id,
        itemType: item.type,
        targetType: 'CERTIFICATE',
        targetId: certificateId,
        title: activity?.title || 'Certificat',
        student: buildLegacyValidationStudent(student, studentUser, item.requesterName, item.email),
        status: item.status,
        submittedAt: item.raw?.submittedAt || item.createdAt,
        description: activity?.description || 'Certificat soumis pour validation.',
        content: {
          title: activity?.title || 'Certificat',
          description: activity?.description || null,
          files: buildLegacyValidationFiles(item.raw?.documentUrl, 'certificat'),
        },
        targetDetails: {
          issuer: activity?.organization || null,
          issueDate: activity?.startDate || null,
          expirationDate: activity?.endDate || null,
          credentialUrl: item.raw?.documentUrl || null,
        },
        raw: item.raw,
      };
    }

    case 'RECOMMENDATION_LETTER_VALIDATION': {
      const student = item.raw?.student || null;
      const studentUser = student?.user || null;
      const title = item.raw?.title || 'Lettre de recommandation';

      return {
        id: item.id,
        itemType: item.type,
        targetType: 'ACTIVITY',
        targetId: item.id,
        title,
        student: buildLegacyValidationStudent(student, studentUser, item.requesterName, item.email),
        status: item.status,
        submittedAt: item.createdAt,
        description: item.raw?.content || null,
        content: {
          title,
          description: item.raw?.content || null,
          files: buildLegacyValidationFiles(item.raw?.documentUrl, 'recommendation-letter'),
        },
        targetDetails: {
          organization: null,
          role: item.raw?.authorName || null,
          description: item.raw?.content || null,
        },
        raw: item.raw,
      };
    }

    case 'COMMENT_VALIDATION': {
      const student = item.raw?.portfolio?.student || null;
      const studentUser = student?.user || null;
      const title = item.raw?.title || 'Commentaire';

      return {
        id: item.id,
        itemType: item.type,
        targetType: 'ACTIVITY',
        targetId: item.raw?.targetId || item.id,
        title,
        student: buildLegacyValidationStudent(student, studentUser, item.requesterName, item.email),
        status: item.status,
        submittedAt: item.createdAt,
        description: item.raw?.content || null,
        content: {
          title,
          description: item.raw?.content || null,
          files: [],
        },
        targetDetails: {
          organization: null,
          role: item.requesterName || null,
          description: item.raw?.content || null,
        },
        raw: item.raw,
      };
    }

    case 'RECOMMENDATION_VALIDATION': {
      const student = item.raw?.student || null;
      const studentUser = student?.user || null;
      const title = item.raw?.title || 'Recommendation';

      return {
        id: item.id,
        itemType: item.type,
        targetType: 'ACTIVITY',
        targetId: item.id,
        title,
        student: buildLegacyValidationStudent(student, studentUser, item.requesterName, item.email),
        status: item.status,
        submittedAt: item.createdAt,
        description: item.raw?.content || null,
        content: {
          title,
          description: item.raw?.content || null,
          files: [],
        },
        targetDetails: {
          organization: item.raw?.organization || item.organization || null,
          role: item.raw?.authorJobTitle || null,
          description: item.raw?.content || null,
        },
        raw: item.raw,
      };
    }

    default:
      return {
        id: item.id,
        itemType: item.type,
        targetType: 'ACTIVITY',
        targetId: item.id,
        title: item.label,
        student: {
          id: null,
          fullName: item.requesterName,
          email: item.email,
          profilePicture: null,
          field: null,
          level: null,
          city: null,
        },
        status: item.status,
        submittedAt: item.createdAt,
        description: null,
        content: {
          title: item.label,
          description: null,
          files: [],
        },
        targetDetails: {},
        raw: item.raw,
      };
  }
};

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

const getNotificationTone = (type, relatedType = null) => {
  const effectiveType = relatedType || type;

  switch (effectiveType) {
    case 'ACCESS_REQUEST':
      return 'orange';
    case 'REPORT':
      return 'red';
    case 'SYSTEM':
      return 'blue';
    default:
      return 'green';
  }
};

const getNotificationLink = (type, relatedType = null) => {
  const effectiveType = relatedType || type;

  switch (effectiveType) {
    case 'ACCESS_REQUEST':
      return '/admin/dashboard';
    case 'REPORT':
      return '/admin/reports';
    case 'CERTIFICATE_VALIDATION':
    case 'RECOMMENDATION_LETTER_VALIDATION':
    case 'COMMENT_VALIDATION':
    case 'RECOMMENDATION_VALIDATION':
      return '/admin/validations';
    default:
      return '/admin/notifications';
  }
};

const getLegacyNotificationType = (type, relatedType = null) => {
  const effectiveType = relatedType || type;

  switch (effectiveType) {
    case 'REPORT':
      return 'ALERT';
    case 'ACCESS_REQUEST':
    case 'SYSTEM':
      return 'INFO';
    default:
      return 'VALIDATION';
  }
};

const mapNotificationItem = (notification) => ({
  id: notification.id,
  type: getLegacyNotificationType(notification.type, notification.relatedType),
  notificationType: notification.type,
  title: notification.title,
  message: notification.message,
  read: notification.isRead,
  isRead: notification.isRead,
  createdAt: notification.createdAt,
  readAt: notification.readAt,
  tone: getNotificationTone(notification.type, notification.relatedType),
  link: getNotificationLink(notification.type, notification.relatedType),
  target:
    notification.relatedId && (notification.relatedType || notification.type)
      ? {
          itemType: notification.relatedType || notification.type,
          itemId: notification.relatedId,
        }
      : null,
  raw: {
    administratorId: notification.administratorId,
    notificationType: notification.type,
    relatedType: notification.relatedType,
    relatedId: notification.relatedId,
  },
});

module.exports = {
  formatFullName,
  mapCertificateRequestDetail,
  mapCommentValidationItem,
  mapDashboardAccessRequest,
  mapDashboardCertificateRequest,
  mapInternshipValidationItem,
  mapNotificationItem,
  mapProfessionalRequestDetail,
  mapProjectValidationItem,
  mapRecommendationLetterValidationItem,
  mapRecommendationValidationItem,
  mapReportItem,
  mapUserSummary,
  mapValidationItemToLegacyShape,
};
