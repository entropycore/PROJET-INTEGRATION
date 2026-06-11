'use strict';

const { formatFullName } = require('./userMappers');

const extractFileNameFromUrl = (url, fallbackName) => {
  if (!url) {
    return fallbackName;
  }

  try {
    const pathname = new URL(url).pathname;
    const fileName = pathname.split('/').filter(Boolean).pop();
    return !fileName || ['content', 'download'].includes(fileName) ? fallbackName : fileName;
  } catch {
    const fileName = String(url).split('/').filter(Boolean).pop();
    return !fileName || ['content', 'download'].includes(fileName) ? fallbackName : fileName;
  }
};

const buildAdminValidationFileUrl = (itemType, itemId, fileId, action = 'download') =>
  `/api/admin/validations/${itemType}/${itemId}/files/${fileId}/${action}`;

const buildLegacyValidationStudent = (student, user, fallbackName, fallbackEmail = null) => ({
  id: student?.id || null,
  fullName: user ? formatFullName(user) : fallbackName || 'Utilisateur inconnu',
  email: user?.email || fallbackEmail || null,
  profilePicture: user?.profilePicture || null,
  field: student?.major || null,
  level: student?.level || null,
  city: student?.city || null,
});

const buildLegacyValidationFiles = (url, fallbackName, safeUrl = null, size = null) =>
  url
    ? [
        {
          id: url,
          name: extractFileNameFromUrl(url, fallbackName),
          size,
          url: safeUrl || url,
        },
      ]
    : [];

const buildLegacyValidationMediaFiles = (validationId, media = []) =>
  Array.isArray(media)
    ? media
        .filter((item) => item?.mediaUrl)
        .map((item, index) => ({
          id: item.id || item.mediaUrl || `project-media-${index + 1}`,
          name:
            item.fileName ||
            item.description ||
            extractFileNameFromUrl(
              item.mediaUrl,
              item.mediaType ? `${String(item.mediaType).toLowerCase()}-${index + 1}` : `media-${index + 1}`,
            ),
          size: item.fileSize || null,
          url: item.id
            ? buildAdminValidationFileUrl(
                'PROJECT',
                validationId,
                item.id,
                ['IMAGE', 'SCREENSHOT'].includes(String(item.mediaType || '').toUpperCase())
                  ? 'content'
                  : 'download',
              )
            : item.mediaUrl,
        }))
    : [];

const formatTechnologyLabel = (technology) =>
  technology?.version ? `${technology.name} ${technology.version}` : technology?.name || null;

const mapProjectLegacyValidation = (item) => {
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
      files: buildLegacyValidationMediaFiles(item.id, item.raw?.media),
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
};

const mapInternshipLegacyValidation = (item) => {
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
      files: buildLegacyValidationFiles(
        item.raw?.reportUrl,
        item.raw?.reportFileName || 'rapport-stage',
        buildAdminValidationFileUrl('INTERNSHIP', item.id, 'report', 'download'),
        item.raw?.reportFileSize || null,
      ),
    },
    targetDetails: {
      company: item.raw?.hostOrganization || item.organization || null,
      startDate: item.raw?.startDate || null,
      endDate: item.raw?.endDate || null,
    },
    raw: item.raw,
  };
};

const mapCertificateLegacyValidation = (item) => {
  const student = item.raw?.student || null;
  const studentUser = student?.user || null;
  const activity = item.raw?.activity || null;
  const certificateId = item.raw?.certificateId || item.id;
  const certificateUrl = item.raw?.documentUrl
    ? buildAdminValidationFileUrl('CERTIFICATE_VALIDATION', certificateId, 'certificate', 'download')
    : null;

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
      files: buildLegacyValidationFiles(
        item.raw?.documentUrl,
        item.raw?.fileName || 'certificat',
        certificateUrl,
        item.raw?.fileSize || null,
      ),
    },
    targetDetails: {
      issuer: activity?.organization || null,
      issueDate: activity?.startDate || null,
      expirationDate: activity?.endDate || null,
      credentialUrl: certificateUrl || item.raw?.documentUrl || null,
    },
    raw: item.raw,
  };
};

const mapRecommendationLetterLegacyValidation = (item) => {
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
};

const mapCommentLegacyValidation = (item) => {
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
};

const mapRecommendationLegacyValidation = (item) => {
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
};

const mapDefaultLegacyValidation = (item) => ({
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
});

const mapValidationItemToLegacyShape = (item) => {
  switch (item.type) {
    case 'PROJECT':
      return mapProjectLegacyValidation(item);
    case 'INTERNSHIP':
      return mapInternshipLegacyValidation(item);
    case 'CERTIFICATE_VALIDATION':
      return mapCertificateLegacyValidation(item);
    case 'RECOMMENDATION_LETTER_VALIDATION':
      return mapRecommendationLetterLegacyValidation(item);
    case 'COMMENT_VALIDATION':
      return mapCommentLegacyValidation(item);
    case 'RECOMMENDATION_VALIDATION':
      return mapRecommendationLegacyValidation(item);
    default:
      return mapDefaultLegacyValidation(item);
  }
};

module.exports = {
  mapValidationItemToLegacyShape,
};
