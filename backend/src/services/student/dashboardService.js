'use strict';

const {
  buildCredibility,
  buildDashboardNotifications,
  buildProfileCompletion,
  buildTimeline,
  computeDashboardStats,
  formatFullName,
  mapDashboardProject,
} = require('./dashboardHelpers');
const { getStudentDashboardBaseOrThrow, getStudentOrThrow } = require('./studentData');

const getStudentDashboard = async (userId) => {
  const student = await getStudentDashboardBaseOrThrow(userId);
  const fullStudent = await getStudentOrThrow(userId);
  const profileCompletion = buildProfileCompletion(fullStudent);
  const stats = await computeDashboardStats(student);
  const credibility = buildCredibility(stats, profileCompletion.completionRate);
  const notifications = buildDashboardNotifications(stats);

  return {
    user: {
      id: student.user.id,
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      fullName: formatFullName(student.user),
      email: student.user.email,
      profilePicture: student.user.profilePicture,
      accountStatus: student.user.accountStatus,
      field: student.major,
      major: student.major,
      level: student.level,
      city: student.city,
      lastLoginAt: student.user.lastLoginAt,
    },
    stats: {
      validatedProjects: stats.validatedProjects,
      credibilityScore: credibility.score,
      badgesCount: stats.badgesCount,
      recommendationsCount: stats.recommendationsCount,
      pendingRecommendations: stats.pendingRecommendations,
    },
    credibility,
    recentProjects: student.projects.map(mapDashboardProject),
    badges: stats.badges.filter((badge) => badge.isObtained).slice(0, 5),
    notifications,
    profileSnapshot: {
      id: student.user.id,
      fullName: formatFullName(student.user),
      email: student.user.email,
      profilePicture: student.user.profilePicture,
      accountStatus: student.user.accountStatus,
      lastLoginAt: student.user.lastLoginAt,
      major: student.major,
      level: student.level,
      city: student.city,
    },
    summaryCards: {
      projects: { value: stats.totalProjects, label: 'Projets' },
      internships: { value: stats.totalInternships, label: 'Stages' },
      activities: { value: stats.totalActivities, label: 'Activités' },
      certificates: { value: stats.totalCertificates, label: 'Certificats' },
      recommendationLetters: {
        value: stats.totalRecommendationLetters,
        label: 'Lettres de recommandation',
      },
      recommendations: {
        value: stats.recommendationsCount,
        label: 'Recommandations',
      },
    },
    validationOverview: {
      pendingProjects: stats.pendingProjects,
      pendingInternships: stats.pendingInternships,
      pendingCertificates: stats.pendingCertificates,
      pendingRecommendationLetters: stats.pendingRecommendationLetters,
      pendingRecommendations: stats.pendingRecommendations,
    },
    portfolio: student.portfolio,
    recentItems: {
      projects: student.projects.map(mapDashboardProject),
      internships: student.internships,
      activities: student.activities,
    },
  };
};

const getStudentCredibilityScore = async (userId) => {
  const student = await getStudentDashboardBaseOrThrow(userId);
  const fullStudent = await getStudentOrThrow(userId);
  const profileCompletion = buildProfileCompletion(fullStudent);
  const stats = await computeDashboardStats(student);

  return buildCredibility(stats, profileCompletion.completionRate);
};

const getStudentCredibilityScoreDetails = async (userId) => {
  const credibility = await getStudentCredibilityScore(userId);
  return credibility.details;
};

const getStudentProfileCompletion = async (userId) => {
  const student = await getStudentOrThrow(userId);
  return buildProfileCompletion(student);
};

const getStudentTimeline = async (userId) => {
  const student = await getStudentDashboardBaseOrThrow(userId);
  const stats = await computeDashboardStats(student);
  return buildTimeline(student, stats);
};

const getStudentBadges = async (userId) => {
  const student = await getStudentDashboardBaseOrThrow(userId);
  const stats = await computeDashboardStats(student);

  return stats.badges;
};

module.exports = {
  getStudentBadges,
  getStudentCredibilityScore,
  getStudentCredibilityScoreDetails,
  getStudentDashboard,
  getStudentProfileCompletion,
  getStudentTimeline,
};
