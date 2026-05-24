'use strict';

const { formatFullName } = require('./dashboardHelpers');

const OBJECTIVE_LABELS = {
  WEB_DEVELOPER: 'Développeur Web',
  DEVOPS: 'DevOps',
  DATA: 'Data Science',
  CYBERSECURITY: 'Cybersécurité',
};

const safeNumber = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const slugify = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

const formatShortDate = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().slice(0, 10);
};

const mapObjective = (value) => {
  const objective = String(value || '').trim();

  return {
    value: objective,
    label: OBJECTIVE_LABELS[objective] || objective,
  };
};

const mapCredibility = (credibility) => {
  let level = 'BEGINNER';
  let label = 'Niveau débutant';

  if (credibility.score >= 80) {
    level = 'ADVANCED';
    label = 'Niveau avancé';
  } else if (credibility.score >= 60) {
    level = 'INTERMEDIATE';
    label = 'Niveau solide';
  } else if (credibility.score >= 40) {
    level = 'PROGRESSING';
    label = 'Niveau en progression';
  }

  return {
    score: credibility.score,
    level,
    label,
    details: credibility.details,
  };
};

const mapDomain = (domain) => {
  if (!domain) return null;

  return {
    id: domain.id,
    name: domain.name,
    slug: domain.slug,
  };
};

const mapSkill = (studentSkill) => ({
  id: studentSkill.id,
  skillId: studentSkill.skill.id,
  name: studentSkill.skill.name,
  type: studentSkill.skill.type,
  description: studentSkill.skill.description || '',
  masteryLevel: studentSkill.masteryLevel || '0',
  score: safeNumber(studentSkill.masteryLevel),
  source: studentSkill.skillSource || '',
  domain: mapDomain(studentSkill.skill.domain),
  updatedAt: studentSkill.updatedAt,
});

const splitProjectMedia = (media) => {
  const result = {
    screenshots: [],
    attachments: [],
    links: [],
  };

  media.forEach((item) => {
    const mediaType = String(item.mediaType || '').toUpperCase();

    if (mediaType === 'SCREENSHOT' || mediaType === 'IMAGE') {
      result.screenshots.push({
        id: item.id,
        title: item.description || item.fileName || 'Capture',
        imageUrl: item.mediaUrl,
        mimeType: item.mimeType || null,
        fileSize: item.fileSize || null,
      });
      return;
    }

    if (mediaType === 'LINK' || mediaType === 'DOCUMENTATION' || mediaType === 'PORTFOLIO') {
      result.links.push({
        id: item.id,
        label: item.description || mediaType,
        url: item.mediaUrl,
        type: mediaType,
      });
      return;
    }

    result.attachments.push({
      id: item.id,
      name: item.fileName || item.description || 'Pièce jointe',
      url: item.mediaUrl,
      type: mediaType || 'ATTACHMENT',
      mimeType: item.mimeType || null,
      fileSize: item.fileSize || null,
    });
  });

  return result;
};

const mapProject = (project) => {
  const media = splitProjectMedia(project.media);

  return {
    id: project.id,
    title: project.title,
    description: project.description,
    type: project.type,
    role: project.teamRole || '',
    teamSize: project.teamSize || '',
    technologies: project.technologies.map((item) => item.technology.name),
    githubUrl: project.githubUrl || '',
    demoUrl: project.youtubeUrl || '',
    result: project.result || '',
    visibility: project.visibility,
    validationStatus: project.validationStatus,
    createdAt: project.createdAt,
    submittedAt: project.submittedAt,
    screenshots: media.screenshots,
    attachments: media.attachments,
    links: media.links,
  };
};

const parseInternshipContent = (internship) => {
  const fallback = {
    title: internship.hostOrganization
      ? `Stage chez ${internship.hostOrganization}`
      : 'Stage',
    description: internship.missions || '',
    missions: internship.missions
      ? String(internship.missions)
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean)
      : [],
  };

  if (!internship.missions) return fallback;

  try {
    const parsed = JSON.parse(internship.missions);

    if (parsed && parsed.version === 1) {
      return {
        title: parsed.title || fallback.title,
        description: parsed.description || '',
        missions: Array.isArray(parsed.missions) ? parsed.missions : [],
      };
    }
  } catch (error) {
    return fallback;
  }

  return fallback;
};

const mapInternship = (internship) => {
  const content = parseInternshipContent(internship);

  return {
    id: internship.id,
    title: content.title,
    company: internship.hostOrganization,
    duration: internship.duration || '',
    startDate: internship.startDate,
    endDate: internship.endDate,
    description: content.description,
    missions: content.missions,
    technologies: internship.technologies.map((item) => item.technology.name),
    reportUrl: internship.reportUrl || '',
    images: internship.media.map((media) => ({
      id: media.id,
      title: media.description || media.fileName || 'Capture',
      imageUrl: media.mediaUrl,
      mimeType: media.mimeType || null,
      fileSize: media.fileSize || null,
    })),
    visibility: internship.visibility,
    validationStatus: internship.validationStatus,
  };
};

const mapActivity = (activity) => {
  const certificate = activity.certificates[0] || null;

  return {
    id: activity.id,
    title: activity.title,
    type: activity.type,
    organization: activity.organization || '',
    date: formatShortDate(activity.startDate),
    startDate: activity.startDate,
    endDate: activity.endDate,
    duration: activity.duration || '',
    location: activity.location || '',
    description: activity.description || '',
    certificateName: certificate?.fileName || '',
    certificateUrl: certificate?.documentUrl || '',
    visibility: activity.visibility,
    validationStatus: activity.validationStatus,
  };
};

const mapAuthor = (user, extra = {}) => ({
  id: user.id,
  name: formatFullName(user),
  role: extra.role || user.role || '',
  organization: extra.organization || '',
  profilePicture: user.profilePicture || '',
});

const mapRecommendationLetter = (letter) => ({
  id: letter.id,
  title: letter.title,
  content: letter.content,
  type: letter.type,
  documentUrl: letter.documentUrl || '',
  downloadable: letter.downloadable,
  visibility: letter.visibility,
  createdAt: letter.createdAt,
  validatedAt: letter.validatedAt,
  author: mapAuthor(letter.authorUser),
});

const mapRecommendation = (recommendation) => ({
  id: recommendation.id,
  title: recommendation.title,
  content: recommendation.content,
  type: recommendation.recommendationType || '',
  organization: recommendation.organization || '',
  authorJobTitle: recommendation.authorJobTitle || '',
  visibility: recommendation.visibility,
  status: recommendation.status,
  createdAt: recommendation.createdAt,
  validatedAt: recommendation.validatedAt,
  author: mapAuthor(recommendation.authorUser, {
    role: recommendation.authorJobTitle,
    organization: recommendation.organization,
  }),
});

const mapAcademicPath = (path) => ({
  id: path.id,
  institution: path.institution,
  degree: path.degree,
  major: path.major || '',
  startDate: path.startDate,
  endDate: path.endDate,
  honor: path.honor || '',
});


module.exports = {
  mapAcademicPath,
  mapActivity,
  mapCredibility,
  mapInternship,
  mapObjective,
  mapProject,
  mapRecommendation,
  mapRecommendationLetter,
  mapSkill,
  slugify,
};
