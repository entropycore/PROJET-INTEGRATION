'use strict';

const { formatFullName } = require('./userMappers');

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
      fileName: certificate.fileName,
      mimeType: certificate.mimeType,
      fileSize: certificate.fileSize,
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
      fileName: certificate.fileName,
      mimeType: certificate.mimeType,
      fileSize: certificate.fileSize,
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

module.exports = {
  mapCertificateRequestDetail,
  mapCommentValidationItem,
  mapDashboardCertificateRequest,
  mapRecommendationLetterValidationItem,
  mapRecommendationValidationItem,
};
