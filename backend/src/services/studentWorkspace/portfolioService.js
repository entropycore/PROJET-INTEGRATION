'use strict';

const {
  bcrypt,
  crypto,
  prisma,
  VALID_VISIBILITIES,
  VALID_RECOMMENDATION_STATUSES,
  VALID_PROJECT_TYPES,
  VALID_ACTIVITY_TYPES,
  serviceError,
  toEnum,
  toDate,
  normalizePreferences,
  requireBoolean,
  fromRecommendationUiStatus,
  getStudentOrThrow,
  ensureProjectOwner,
  ensureInternshipOwner,
  ensureActivityOwner,
  projectInclude,
  internshipInclude,
  activityInclude,
  fullName,
  recommendationInclude,
  mapStudentRecommendation,
  mapProject,
  mapInternship,
  mapInternshipMedia,
  mapActivity,
  syncTechnologies,
} = require('./shared');

const projectService = require('./projectService');
const stageService = require('./stageService');
const activityService = require('./activityService');

exports.getPortfolioPreview = async (userId) => {
  const student = await getStudentOrThrow(userId);
  const [portfolio, projects, internships, activities, skills] = await Promise.all([
    prisma.portfolio.findUnique({ where: { studentId: student.id } }),
    projectService.listProjects(userId),
    stageService.listStages(userId),
    activityService.listActivities(userId),
    prisma.studentSkill.findMany({
      where: { studentId: student.id },
      include: { skill: true },
      orderBy: { updatedAt: 'desc' },
    }),
  ]);

  return {
    portfolio,
    student,
    projects,
    internships,
    activities,
    skills: skills.map((item) => ({
      id: item.id,
      name: item.skill.name,
      type: item.skill.type,
      masteryLevel: item.masteryLevel,
    })),
  };
};

exports.generatePortfolio = async (userId, payload = {}) => {
  const student = await getStudentOrThrow(userId);
  const slugBase = `${student.user.firstName}-${student.user.lastName}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const publicSlug = payload.publicSlug || `${slugBase || 'portfolio'}-${student.id.slice(0, 8)}`;

  await prisma.portfolio.upsert({
    where: { studentId: student.id },
    update: {
      title: payload.title || `${fullName(student.user)} - Portfolio`,
      description: payload.description || null,
      visibility: toEnum(payload.visibility, 'PRIVATE', VALID_VISIBILITIES),
      status: payload.status || 'ACTIVE',
      targetDomain: payload.targetDomain || null,
      theme: payload.theme || 'modern-academic',
      includedSections: payload.includedSections || [],
      includedItems: payload.includedItems || {},
    },
    create: {
      studentId: student.id,
      title: payload.title || `${fullName(student.user)} - Portfolio`,
      publicSlug,
      description: payload.description || null,
      visibility: toEnum(payload.visibility, 'PRIVATE', VALID_VISIBILITIES),
      status: payload.status || 'ACTIVE',
      targetDomain: payload.targetDomain || null,
      theme: payload.theme || 'modern-academic',
      includedSections: payload.includedSections || [],
      includedItems: payload.includedItems || {},
    },
  });

  return exports.getPortfolioPreview(userId);
};

exports.getPublicPortfolio = async (slug) => {
  const portfolio = await prisma.portfolio.findUnique({
    where: { publicSlug: slug },
    include: { student: { include: { user: true } } },
  });
  if (!portfolio || portfolio.visibility === 'PRIVATE') {
    throw serviceError('PORTFOLIO_NOT_FOUND', 404);
  }
  return exports.getPortfolioPreview(portfolio.student.userId);
};
