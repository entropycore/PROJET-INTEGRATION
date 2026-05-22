'use strict';

const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const studentProjectService = require('./studentProjectService');
const {
  buildCredibility,
  buildDashboardNotifications,
  buildProfileCompletion,
  buildTimeline,
  computeDashboardStats,
  formatFullName,
  mapDashboardProject,
  mapStudentProfile,
  toStudentNotificationType,
} = require('./student/dashboardHelpers');
const { studentDashboardSelect, studentProfileSelect } = require('./student/profileSelects');
const {
  buildStudentPreferencesPayload,
  ensureBoolean,
  mergeStudentSettings,
  normalizeProfileVisibility,
} = require('./student/settingsHelpers');

const safeNumber = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const updateStudentSettingsPreferences = async (userId, updater) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      preferences: true,
    },
  });

  if (!user) {
    throw new Error('STUDENT_PROFILE_NOT_FOUND');
  }

  const currentSettings = mergeStudentSettings(user.preferences);
  const nextSettings = updater(currentSettings);
  const nextPreferences = buildStudentPreferencesPayload(user.preferences, nextSettings);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      preferences: nextPreferences,
    },
  });

  return nextSettings;
};

const getStudentOrThrow = async (userId) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: studentProfileSelect,
  });

  if (!student) {
    throw new Error('STUDENT_PROFILE_NOT_FOUND');
  }

  return student;
};

const getStudentDashboardBaseOrThrow = async (userId) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: studentDashboardSelect,
  });

  if (!student) {
    throw new Error('STUDENT_PROFILE_NOT_FOUND');
  }

  return student;
};

exports.getStudentProfile = async (userId) => mapStudentProfile(await getStudentOrThrow(userId));

exports.getStudentDashboard = async (userId) => {
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
      activities: { value: stats.totalActivities, label: 'Activites' },
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

exports.getStudentCredibilityScore = async (userId) => {
  const student = await getStudentDashboardBaseOrThrow(userId);
  const fullStudent = await getStudentOrThrow(userId);
  const profileCompletion = buildProfileCompletion(fullStudent);
  const stats = await computeDashboardStats(student);

  return buildCredibility(stats, profileCompletion.completionRate);
};

exports.getStudentCredibilityScoreDetails = async (userId) => {
  const credibility = await exports.getStudentCredibilityScore(userId);
  return credibility.details;
};

exports.getStudentProfileCompletion = async (userId) => {
  const student = await getStudentOrThrow(userId);
  return buildProfileCompletion(student);
};

exports.getStudentTimeline = async (userId) => {
  const student = await getStudentDashboardBaseOrThrow(userId);
  const stats = await computeDashboardStats(student);
  return buildTimeline(student, stats);
};

exports.getStudentBadges = async (userId) => {
  const student = await getStudentDashboardBaseOrThrow(userId);
  const stats = await computeDashboardStats(student);

  return stats.badges;
};

exports.getUnreadStudentNotifications = async (userId) => {
  const student = await getStudentDashboardBaseOrThrow(userId);
  const stats = await computeDashboardStats(student);
  const notifications = buildDashboardNotifications(stats);

  return {
    items: notifications.filter((notification) => !notification.read),
    count: notifications.filter((notification) => !notification.read).length,
    studentId: student.id,
  };
};

exports.listStudentNotifications = async (userId, filters = {}) => {
  const student = await getStudentDashboardBaseOrThrow(userId);
  const stats = await computeDashboardStats(student);

  let items = buildDashboardNotifications(stats).map((notification) => ({
    ...notification,
    type: toStudentNotificationType(notification.type),
  }));

  if (filters.read === 'true') {
    items = items.filter((notification) => notification.read);
  }

  if (filters.read === 'false') {
    items = items.filter((notification) => !notification.read);
  }

  if (filters.type && filters.type !== 'ALL') {
    items = items.filter((notification) => notification.type === filters.type);
  }

  return {
    items,
    summary: {
      total: items.length,
      unread: items.filter((notification) => !notification.read).length,
      read: items.filter((notification) => notification.read).length,
    },
    studentId: student.id,
  };
};

exports.getStudentUnreadNotificationCount = async (userId) => {
  const notifications = await exports.listStudentNotifications(userId);
  return {
    count: notifications.summary.unread,
  };
};

exports.markStudentNotificationAsRead = async (userId, notificationId) => {
  const notifications = await exports.listStudentNotifications(userId);
  const notification = notifications.items.find((item) => item.id === notificationId);

  if (!notification) {
    throw new Error('STUDENT_NOTIFICATION_NOT_FOUND');
  }

  return {
    ...notification,
    read: true,
  };
};

exports.markAllStudentNotificationsAsRead = async (userId) => {
  const notifications = await exports.listStudentNotifications(userId);

  return {
    markedCount: notifications.items.length,
  };
};

exports.deleteStudentNotification = async (userId, notificationId) => {
  const notifications = await exports.listStudentNotifications(userId);
  const notification = notifications.items.find((item) => item.id === notificationId);

  if (!notification) {
    throw new Error('STUDENT_NOTIFICATION_NOT_FOUND');
  }

  return {
    deleted: true,
    id: notificationId,
  };
};

exports.getStudentProfileCompat = async (userId) => {
  const student = await getStudentOrThrow(userId);

  return {
    id: student.user.id,
    studentId: student.id,
    firstName: student.user.firstName,
    lastName: student.user.lastName,
    fullName: formatFullName(student.user),
    email: student.user.email,
    phone: student.user.phone || '',
    field: student.major,
    major: student.major,
    level: student.level,
    city: student.city || '',
    bio: student.bio || '',
    linkedinUrl: student.linkedinUrl || '',
    profilePicture: student.user.profilePicture,
    apogeeCode: student.apogeeCode,
    cne: student.cne,
    careerGoal: student.careerObjective || '',
    address: student.address || '',
    birthDate: student.birthDate,
  };
};

exports.updateStudentProfileCompat = async (userId, payload) => {
  const student = await getStudentOrThrow(userId);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: student.user.id },
      data: {
        firstName: payload.firstName ?? student.user.firstName,
        lastName: payload.lastName ?? student.user.lastName,
        phone: payload.phone ?? student.user.phone,
      },
    }),
    prisma.student.update({
      where: { id: student.id },
      data: {
        city: payload.city ?? student.city,
        bio: payload.bio ?? student.bio,
        linkedinUrl: payload.linkedinUrl ?? student.linkedinUrl,
        major: payload.field ?? payload.major ?? student.major,
        level: payload.level ?? student.level,
        careerObjective: payload.careerGoal ?? payload.careerObjective ?? student.careerObjective,
      },
    }),
  ]);

  return exports.getStudentProfileCompat(userId);
};

exports.listAcademicPaths = async (userId) => {
  const student = await getStudentOrThrow(userId);

  return student.academicPaths.map((item) => ({
    id: item.id,
    institution: item.institution,
    degree: item.degree,
    field: item.major,
    startDate: item.startDate,
    endDate: item.endDate,
    honor: item.honor,
  }));
};

exports.createAcademicPath = async (userId, payload) => {
  const student = await getStudentOrThrow(userId);

  await prisma.academicPath.create({
    data: {
      studentId: student.id,
      institution: payload.institution,
      degree: payload.degree,
      major: payload.field ?? payload.major ?? null,
      startDate: payload.startDate ? new Date(payload.startDate) : null,
      endDate: payload.endDate ? new Date(payload.endDate) : null,
      honor: payload.honor ?? null,
    },
  });

  return exports.listAcademicPaths(userId);
};

exports.updateAcademicPath = async (userId, academicPathId, payload) => {
  const student = await getStudentOrThrow(userId);
  const existing = await prisma.academicPath.findFirst({
    where: {
      id: academicPathId,
      studentId: student.id,
    },
  });

  if (!existing) {
    throw new Error('ACADEMIC_PATH_NOT_FOUND');
  }

  await prisma.academicPath.update({
    where: { id: academicPathId },
    data: {
      institution: payload.institution ?? existing.institution,
      degree: payload.degree ?? existing.degree,
      major: payload.field ?? payload.major ?? existing.major,
      startDate: payload.startDate ? new Date(payload.startDate) : existing.startDate,
      endDate: payload.endDate ? new Date(payload.endDate) : existing.endDate,
      honor: payload.honor ?? existing.honor,
    },
  });

  return exports.listAcademicPaths(userId);
};

exports.deleteAcademicPath = async (userId, academicPathId) => {
  const student = await getStudentOrThrow(userId);
  const existing = await prisma.academicPath.findFirst({
    where: {
      id: academicPathId,
      studentId: student.id,
    },
  });

  if (!existing) {
    throw new Error('ACADEMIC_PATH_NOT_FOUND');
  }

  await prisma.academicPath.delete({
    where: { id: academicPathId },
  });

  return {
    deleted: true,
    id: academicPathId,
  };
};

exports.getStudentSoftSkills = async (userId) => {
  const student = await getStudentOrThrow(userId);

  return student.studentSkills
    .filter((studentSkill) => studentSkill.skill.type === 'SOFT_SKILL')
    .map((studentSkill) => ({
      id: studentSkill.id,
      name: studentSkill.skill.name,
    }));
};

exports.addStudentSoftSkill = async (userId, payload) => {
  const student = await getStudentOrThrow(userId);
  const name = String(payload.name || '').trim();

  if (!name) {
    throw new Error('SOFT_SKILL_NAME_REQUIRED');
  }

  const skill = await prisma.skill.upsert({
    where: { name },
    update: {
      type: 'SOFT_SKILL',
    },
    create: {
      name,
      type: 'SOFT_SKILL',
    },
  });

  await prisma.studentSkill.upsert({
    where: {
      studentId_skillId: {
        studentId: student.id,
        skillId: skill.id,
      },
    },
    update: {
      updatedAt: new Date(),
    },
    create: {
      studentId: student.id,
      skillId: skill.id,
      masteryLevel: '100',
      skillSource: 'PROFILE',
    },
  });

  return exports.getStudentSoftSkills(userId);
};

exports.deleteStudentSoftSkill = async (userId, studentSkillId) => {
  const student = await getStudentOrThrow(userId);
  const studentSkill = await prisma.studentSkill.findFirst({
    where: {
      id: studentSkillId,
      studentId: student.id,
      skill: {
        type: 'SOFT_SKILL',
      },
    },
  });

  if (!studentSkill) {
    throw new Error('SOFT_SKILL_NOT_FOUND');
  }

  await prisma.studentSkill.delete({
    where: { id: studentSkill.id },
  });

  return {
    deleted: true,
    id: studentSkillId,
  };
};

exports.getStudentCareerGoal = async (userId) => {
  const student = await getStudentOrThrow(userId);

  return {
    careerGoal: student.careerObjective || '',
  };
};

exports.updateStudentCareerGoal = async (userId, payload) => {
  const student = await getStudentOrThrow(userId);

  await prisma.student.update({
    where: { id: student.id },
    data: {
      careerObjective: payload.careerGoal ?? payload.careerObjective ?? '',
    },
  });

  return exports.getStudentCareerGoal(userId);
};

exports.updateStudentSettingsPassword = async (userId, payload = {}) => {
  await getStudentOrThrow(userId);

  const currentPassword = String(payload.currentPassword || '');
  const newPassword = String(payload.newPassword || '');
  const confirmPassword = payload.confirmPassword === undefined ? undefined : String(payload.confirmPassword || '');

  if (!currentPassword) {
    throw new Error('CURRENT_PASSWORD_REQUIRED');
  }

  if (!newPassword) {
    throw new Error('NEW_PASSWORD_REQUIRED');
  }

  if (newPassword.length < 8) {
    throw new Error('NEW_PASSWORD_TOO_SHORT');
  }

  if (confirmPassword !== undefined && newPassword !== confirmPassword) {
    throw new Error('PASSWORD_CONFIRMATION_MISMATCH');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw new Error('CURRENT_PASSWORD_INVALID');
  }

  if (await bcrypt.compare(newPassword, user.passwordHash)) {
    throw new Error('NEW_PASSWORD_SAME_AS_CURRENT');
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    }),
    prisma.refreshTokenSession.updateMany({
      where: {
        userId: user.id,
        isRevoked: false,
      },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
      },
    }),
  ]);

  return {
    updated: true,
    sessionsRevoked: true,
  };
};

exports.updateStudentSettingsPrivacy = async (userId, payload = {}) => {
  const student = await getStudentOrThrow(userId);

  const settings = await updateStudentSettingsPreferences(student.user.id, (currentSettings) => ({
    ...currentSettings,
    privacy: {
      profileVisibility:
        payload.profileVisibility === undefined
          ? currentSettings.privacy.profileVisibility
          : normalizeProfileVisibility(payload.profileVisibility),
      showEmail:
        payload.showEmail === undefined
          ? currentSettings.privacy.showEmail
          : ensureBoolean(payload.showEmail, 'INVALID_PRIVACY_BOOLEAN_VALUE'),
      showPhone:
        payload.showPhone === undefined
          ? currentSettings.privacy.showPhone
          : ensureBoolean(payload.showPhone, 'INVALID_PRIVACY_BOOLEAN_VALUE'),
    },
  }));

  return settings.privacy;
};

exports.updateStudentSettingsNotifications = async (userId, payload = {}) => {
  const student = await getStudentOrThrow(userId);

  const settings = await updateStudentSettingsPreferences(student.user.id, (currentSettings) => ({
    ...currentSettings,
    notifications: {
      email:
        payload.email === undefined
          ? currentSettings.notifications.email
          : ensureBoolean(payload.email, 'INVALID_NOTIFICATION_BOOLEAN_VALUE'),
      push:
        payload.push === undefined
          ? currentSettings.notifications.push
          : ensureBoolean(payload.push, 'INVALID_NOTIFICATION_BOOLEAN_VALUE'),
      validationUpdates:
        payload.validationUpdates === undefined
          ? currentSettings.notifications.validationUpdates
          : ensureBoolean(payload.validationUpdates, 'INVALID_NOTIFICATION_BOOLEAN_VALUE'),
      recommendations:
        payload.recommendations === undefined
          ? currentSettings.notifications.recommendations
          : ensureBoolean(payload.recommendations, 'INVALID_NOTIFICATION_BOOLEAN_VALUE'),
    },
  }));

  return settings.notifications;
};

exports.getStudentSkills = async (userId) => {
  const student = await getStudentOrThrow(userId);

  return student.studentSkills
    .filter((studentSkill) => studentSkill.skill.type !== 'SOFT_SKILL')
    .map((studentSkill) => ({
      id: studentSkill.id,
      skillId: studentSkill.skill.id,
      name: studentSkill.skill.name,
      type: studentSkill.skill.type,
      level: safeNumber(studentSkill.masteryLevel),
      source: studentSkill.skillSource || '',
    }));
};

exports.addStudentSkill = async (userId, payload) => {
  const student = await getStudentOrThrow(userId);

  const skill = await prisma.skill.findUnique({
    where: { id: payload.skillId },
  });

  if (!skill) {
    throw new Error('SKILL_NOT_FOUND');
  }

  await prisma.studentSkill.upsert({
    where: {
      studentId_skillId: {
        studentId: student.id,
        skillId: skill.id,
      },
    },
    update: {
      masteryLevel: String(payload.level ?? 0),
      skillSource: payload.source ?? null,
      updatedAt: new Date(),
    },
    create: {
      studentId: student.id,
      skillId: skill.id,
      masteryLevel: String(payload.level ?? 0),
      skillSource: payload.source ?? null,
    },
  });

  return exports.getStudentSkills(userId);
};

exports.deleteStudentSkill = async (userId, studentSkillId) => {
  const student = await getStudentOrThrow(userId);
  const studentSkill = await prisma.studentSkill.findFirst({
    where: {
      id: studentSkillId,
      studentId: student.id,
    },
  });

  if (!studentSkill) {
    throw new Error('STUDENT_SKILL_NOT_FOUND');
  }

  await prisma.studentSkill.delete({
    where: { id: studentSkill.id },
  });

  return {
    deleted: true,
    id: studentSkillId,
  };
};

exports.listSkillsCatalog = async (search = '') =>
  prisma.skill.findMany({
    where: {
      type: {
        not: 'SOFT_SKILL',
      },
      name: {
        contains: search,
        mode: 'insensitive',
      },
    },
    orderBy: {
      name: 'asc',
    },
    select: {
      id: true,
      name: true,
      type: true,
      description: true,
    },
    take: 30,
  });

exports.getStudentGithubAuthLink = async () => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error('GITHUB_NOT_CONFIGURED');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'read:user repo',
  });

  return {
    url: `https://github.com/login/oauth/authorize?${params.toString()}`,
  };
};

exports.getStudentGithubStats = async () => ({
  connected: false,
  username: '',
  profileUrl: '',
  repositories: [],
  languages: [],
  publicRepos: 0,
  totalContributions: 0,
});

exports.importGithubRepository = async (userId, payload) => {
  const repoName = String(payload.repoName || '').trim();

  if (!repoName) {
    throw new Error('GITHUB_REPOSITORY_NAME_REQUIRED');
  }

  return studentProjectService.createProject(userId, {
    title: repoName,
    description: payload.repoDescription || 'Projet importé depuis GitHub.',
    type: 'Personnel',
    role: 'Repository owner',
    technologies: payload.repoLanguage ? [payload.repoLanguage] : [],
    githubUrl: payload.repoUrl || null,
    extraLinks: payload.repoUrl
      ? [
          {
            label: 'GitHub Repository',
            url: payload.repoUrl,
          },
        ]
      : [],
  });
};
