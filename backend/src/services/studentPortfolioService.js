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
const {
  portfolioSelect,
  studentDataSelect,
  studentWithPortfolioSelect,
} = require('./student/portfolioSelects');
const { mergeStudentSettings } = require('./student/settingsHelpers');
const {
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
} = require('./student/portfolioMappers');

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

const getStudentPrivacy = (student) => mergeStudentSettings(student.user?.preferences).privacy;

const resolvePortfolioVisibility = (student) =>
  getStudentPrivacy(student).profileVisibility === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE';

const mapPortfolioContact = (student, isPublicView) => {
  if (!isPublicView) {
    return {
      email: student.user.email,
      phone: student.user.phone || '',
    };
  }

  const privacy = getStudentPrivacy(student);

  return {
    email: privacy.showEmail ? student.user.email : '',
    phone: privacy.showPhone ? student.user.phone || '' : '',
  };
};

const ensurePublicPrivacyAllowsPortfolio = (student) => {
  if (getStudentPrivacy(student).profileVisibility !== 'PUBLIC') {
    throw new Error('PUBLIC_PORTFOLIO_NOT_FOUND');
  }
};

const buildPortfolioPayload = async (student, portfolio = student.portfolio, options = {}) => {
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
  const contact = mapPortfolioContact(student, Boolean(options.publicView));

  return {
    student: {
      id: student.id,
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      fullName: formatFullName(student.user),
      role: 'Étudiant ingénieur',
      major: student.major,
      school,
      email: contact.email,
      phone: contact.phone,
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
  const visibility = resolvePortfolioVisibility(student);

  const portfolio = await prisma.portfolio.upsert({
    where: { studentId: student.id },
    update: {
      title: `Portfolio de ${fullName}`,
      description: student.bio || null,
      visibility,
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
      visibility,
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

  ensurePublicPrivacyAllowsPortfolio(portfolio.student);

  const payload = await buildPortfolioPayload(portfolio.student, portfolio, {
    publicView: true,
  });
  return applyConfig(payload);
};

module.exports = {
  generateStudentPortfolio,
  getPublicPortfolioBySlug,
  getStudentPortfolioPreview,
};


