'use strict';

const crypto = require('crypto');
const prisma = require('../config/prisma');
const githubImportService = require('./student/githubImportService');
const {
  buildCredibility,
  buildProfileCompletion,
  computeDashboardStats,
  formatFullName,
} = require('./student/dashboardHelpers');
const {
  DEFAULT_SECTIONS,
  buildConfigFromPortfolio,
  normalizePortfolioConfig,
} = require('./student/portfolioConfig');

const OBJECTIVE_LABELS = {
  WEB_DEVELOPER: 'Développeur Web',
  DEVOPS: 'DevOps',
  DATA: 'Data Science',
  CYBERSECURITY: 'Cybersécurité',
};

const portfolioSelect = {
  id: true,
  title: true,
  publicSlug: true,
  description: true,
  visibility: true,
  status: true,
  targetDomain: true,
  theme: true,
  includedSections: true,
  includedItems: true,
  generatedAt: true,
  updatedAt: true,
};

const skillSelect = {
  id: true,
  masteryLevel: true,
  skillSource: true,
  updatedAt: true,
  skill: {
    select: {
      id: true,
      name: true,
      type: true,
      description: true,
      domain: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  },
};

const projectSelect = {
  id: true,
  title: true,
  description: true,
  type: true,
  teamRole: true,
  teamSize: true,
  githubUrl: true,
  youtubeUrl: true,
  result: true,
  visibility: true,
  validationStatus: true,
  createdAt: true,
  submittedAt: true,
  validatorProfessor: {
    select: {
      id: true,
      department: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  },
  media: {
    orderBy: { id: 'asc' },
    select: {
      id: true,
      mediaType: true,
      mediaUrl: true,
      description: true,
      fileName: true,
      mimeType: true,
      fileSize: true,
    },
  },
  technologies: {
    orderBy: { id: 'asc' },
    select: {
      technology: {
        select: {
          id: true,
          name: true,
          version: true,
          category: true,
        },
      },
    },
  },
};

const internshipSelect = {
  id: true,
  hostOrganization: true,
  duration: true,
  startDate: true,
  endDate: true,
  missions: true,
  reportUrl: true,
  validationStatus: true,
  visibility: true,
  supervisorProfessor: {
    select: {
      id: true,
      department: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  },
  technologies: {
    orderBy: { id: 'asc' },
    select: {
      technology: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  media: {
    orderBy: { id: 'asc' },
    select: {
      id: true,
      mediaType: true,
      mediaUrl: true,
      description: true,
      fileName: true,
      mimeType: true,
      fileSize: true,
    },
  },
};

const activitySelect = {
  id: true,
  type: true,
  title: true,
  description: true,
  organization: true,
  startDate: true,
  endDate: true,
  duration: true,
  location: true,
  validationStatus: true,
  visibility: true,
  certificates: {
    orderBy: { submittedAt: 'desc' },
    take: 1,
    select: {
      id: true,
      documentUrl: true,
      fileName: true,
      mimeType: true,
      fileSize: true,
      validationStatus: true,
      submittedAt: true,
    },
  },
};

const recommendationAuthorSelect = {
  id: true,
  firstName: true,
  lastName: true,
  role: true,
  profilePicture: true,
};

const studentDataSelect = {
  id: true,
  userId: true,
  major: true,
  level: true,
  city: true,
  bio: true,
  careerObjective: true,
  linkedinUrl: true,
  githubAccessToken: true,
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      profilePicture: true,
    },
  },
  academicPaths: {
    orderBy: [{ endDate: 'desc' }, { startDate: 'desc' }],
    select: {
      id: true,
      institution: true,
      degree: true,
      major: true,
      startDate: true,
      endDate: true,
      honor: true,
    },
  },
  studentSkills: {
    orderBy: [{ updatedAt: 'desc' }],
    select: skillSelect,
  },
  projects: {
    where: { validationStatus: 'APPROVED' },
    orderBy: [{ submittedAt: 'desc' }, { createdAt: 'desc' }],
    select: projectSelect,
  },
  internships: {
    where: { validationStatus: 'APPROVED' },
    orderBy: [{ endDate: 'desc' }, { startDate: 'desc' }],
    select: internshipSelect,
  },
  activities: {
    where: { validationStatus: 'APPROVED' },
    orderBy: [{ endDate: 'desc' }, { startDate: 'desc' }],
    select: activitySelect,
  },
  recommendationLetters: {
    where: { validationStatus: 'APPROVED' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      content: true,
      type: true,
      documentUrl: true,
      visibility: true,
      downloadable: true,
      createdAt: true,
      validatedAt: true,
      authorUser: {
        select: recommendationAuthorSelect,
      },
    },
  },
  recommendations: {
    where: { status: 'APPROVED' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      content: true,
      organization: true,
      authorJobTitle: true,
      recommendationType: true,
      status: true,
      visibility: true,
      createdAt: true,
      validatedAt: true,
      authorUser: {
        select: recommendationAuthorSelect,
      },
    },
  },
};

const studentWithPortfolioSelect = {
  ...studentDataSelect,
  portfolio: {
    select: portfolioSelect,
  },
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
  const validatorName = project.validatorProfessor?.user
    ? formatFullName(project.validatorProfessor.user)
    : '';

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
    validator: validatorName,
    validatorId: project.validatorProfessor?.id || null,
    validatorDepartment: project.validatorProfessor?.department || '',
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
  const supervisorName = internship.supervisorProfessor?.user
    ? formatFullName(internship.supervisorProfessor.user)
    : content.supervisor?.fullName || '';
  const supervisorDepartment =
    internship.supervisorProfessor?.department || content.supervisor?.department || '';

  return {
    id: internship.id,
    title: content.title,
    company: internship.hostOrganization,
    duration: internship.duration || '',
    startDate: internship.startDate,
    endDate: internship.endDate,
    description: content.description,
    missions: content.missions,
    supervisor: supervisorName,
    supervisorId: internship.supervisorProfessor?.id || content.supervisor?.id || null,
    department: supervisorDepartment,
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

const getGithubActivity = async (student) => {
  if (!student.githubAccessToken) {
    return {
      connected: false,
      username: '',
      profileUrl: '',
      totalContributions: 0,
      currentStreak: 0,
      bestStreak: 0,
    };
  }

  try {
    const stats = await githubImportService.getStudentGithubStats(student.userId);

    return {
      connected: true,
      username: stats.username || '',
      profileUrl: stats.profileUrl || '',
      totalContributions: stats.totalContributions || 0,
      currentStreak: 0,
      bestStreak: 0,
      publicRepos: stats.publicRepos || 0,
      languages: stats.languages || [],
    };
  } catch (error) {
    return {
      connected: true,
      username: '',
      profileUrl: '',
      totalContributions: 0,
      currentStreak: 0,
      bestStreak: 0,
    };
  }
};

const getStudentOrThrow = async (userId) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: studentWithPortfolioSelect,
  });

  if (!student) {
    throw new Error('STUDENT_PROFILE_NOT_FOUND');
  }

  return student;
};

const buildSlug = (student) => {
  const nameSlug = slugify(formatFullName(student.user)) || 'portfolio';
  const suffix = crypto.randomUUID().slice(0, 8);
  return `${nameSlug}-${suffix}`;
};

const buildPortfolioPayload = async (student, portfolio = student.portfolio) => {
  const studentForStats = {
    ...student,
    portfolio,
  };
  const profileCompletion = buildProfileCompletion(studentForStats);
  const stats = await computeDashboardStats(student);
  const credibility = buildCredibility(stats, profileCompletion.completionRate);
  const config = buildConfigFromPortfolio(portfolio);
  const githubActivity = await getGithubActivity(student);
  const skills = student.studentSkills.map(mapSkill);
  const school = student.academicPaths[0]?.institution || '';

  return {
    student: {
      id: student.id,
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      fullName: formatFullName(student.user),
      role: 'Étudiant ingénieur',
      major: student.major,
      school,
      email: student.user.email,
      phone: student.user.phone || '',
      city: student.city || '',
      bio: student.bio || '',
      linkedinUrl: student.linkedinUrl || '',
      githubUrl: githubActivity.profileUrl || '',
      profilePicture: student.user.profilePicture || '',
      professionalObjective: mapObjective(student.careerObjective),
    },
    credibilityScore: mapCredibility(credibility),
    skills: skills.filter((skill) => skill.type === 'TECHNICAL'),
    softSkills: skills.filter((skill) => skill.type === 'SOFT_SKILL'),
    badges: stats.badges.filter((badge) => badge.isObtained),
    projects: student.projects.map(mapProject),
    internships: student.internships.map(mapInternship),
    activities: student.activities.map(mapActivity),
    recommendationLetters: student.recommendationLetters.map(mapRecommendationLetter),
    recommendations: student.recommendations.map(mapRecommendation),
    academicPaths: student.academicPaths.map(mapAcademicPath),
    githubActivity,
    portfolioConfig: config,
    portfolio: portfolio
      ? {
          id: portfolio.id,
          title: portfolio.title,
          publicSlug: portfolio.publicSlug,
          description: portfolio.description || '',
          visibility: portfolio.visibility,
          status: portfolio.status,
          targetDomain: portfolio.targetDomain || '',
          generatedAt: portfolio.generatedAt,
          updatedAt: portfolio.updatedAt,
        }
      : null,
  };
};

const filterItemsByIds = (items, ids) => {
  if (!ids.length) return [];
  const selectedIds = new Set(ids);
  return items.filter((item) => selectedIds.has(String(item.id)));
};

const applyConfig = (payload) => {
  const config = payload.portfolioConfig;
  const includedSections = new Set(config.includedSections);
  const nextPayload = {
    ...payload,
    portfolioConfig: config,
  };

  DEFAULT_SECTIONS.forEach((section) => {
    if (!includedSections.has(section) && Array.isArray(nextPayload[section])) {
      nextPayload[section] = [];
    }
  });

  Object.entries(config.includedItems).forEach(([key, ids]) => {
    if (Array.isArray(nextPayload[key])) {
      nextPayload[key] = filterItemsByIds(nextPayload[key], ids);
    }
  });

  if (!includedSections.has('githubActivity')) {
    nextPayload.githubActivity = {
      connected: false,
      username: '',
      totalContributions: 0,
      currentStreak: 0,
      bestStreak: 0,
    };
  }

  return nextPayload;
};

const getStudentPortfolioPreview = async (userId) => {
  const student = await getStudentOrThrow(userId);
  return buildPortfolioPayload(student);
};

const generateStudentPortfolio = async (userId, payload = {}) => {
  const student = await getStudentOrThrow(userId);
  const config = normalizePortfolioConfig(payload);
  const fullName = formatFullName(student.user);
  const targetDomain = String(payload.goal || student.careerObjective || '').trim() || null;

  const portfolio = await prisma.portfolio.upsert({
    where: { studentId: student.id },
    update: {
      title: `Portfolio de ${fullName}`,
      description: student.bio || null,
      visibility: 'PUBLIC',
      status: 'ACTIVE',
      targetDomain,
      theme: config.theme,
      includedSections: config.includedSections,
      includedItems: config.includedItems,
      generatedAt: new Date(),
    },
    create: {
      studentId: student.id,
      title: `Portfolio de ${fullName}`,
      publicSlug: buildSlug(student),
      description: student.bio || null,
      visibility: 'PUBLIC',
      status: 'ACTIVE',
      targetDomain,
      theme: config.theme,
      includedSections: config.includedSections,
      includedItems: config.includedItems,
    },
    select: portfolioSelect,
  });

  const refreshedStudent = await getStudentOrThrow(userId);
  return buildPortfolioPayload(refreshedStudent, portfolio);
};

const getPublicPortfolioBySlug = async (slug) => {
  const portfolio = await prisma.portfolio.findUnique({
    where: { publicSlug: slug },
    select: {
      ...portfolioSelect,
      student: {
        select: studentDataSelect,
      },
    },
  });

  if (!portfolio || portfolio.status !== 'ACTIVE' || portfolio.visibility === 'PRIVATE') {
    throw new Error('PUBLIC_PORTFOLIO_NOT_FOUND');
  }

  const payload = await buildPortfolioPayload(portfolio.student, portfolio);
  return applyConfig(payload);
};

module.exports = {
  generateStudentPortfolio,
  getPublicPortfolioBySlug,
  getStudentPortfolioPreview,
};
