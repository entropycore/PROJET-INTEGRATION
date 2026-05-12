'use strict';

const prisma = require('../config/prisma');
const studentProjectService = require('./studentProjectService');

const PROJECT_TYPE_LABELS = {
  MODULE: 'Module',
  INTEGRATION: 'Intégration',
  HACKATHON: 'Hackathon',
  PERSONAL: 'Personnel',
  INTERNSHIP: 'Stage',
};

const BADGE_CATALOG = [
  {
    id: 'web-developer',
    name: 'Web Developer',
    description: 'Badge pour les etudiants actifs en developpement web.',
    rule: '3 projets valides',
    iconUrl: '',
    iconFallback: 'WD',
    tone: 'blue',
    target: 3,
    current: (stats) => stats.validatedProjects,
  },
  {
    id: 'devops-explorer',
    name: 'DevOps Explorer',
    description: 'Badge lie aux outils DevOps.',
    rule: '2 projets avec plusieurs technologies',
    iconUrl: '',
    iconFallback: 'DX',
    tone: 'cyan',
    target: 2,
    current: (stats) => stats.multiTechProjects,
  },
  {
    id: 'hackathon-participant',
    name: 'Hackathon Participant',
    description: 'Badge pour participation aux evenements.',
    rule: '1 activite de type hackathon',
    iconUrl: '',
    iconFallback: 'HP',
    tone: 'purple',
    target: 1,
    current: (stats) => stats.hackathonActivities,
  },
  {
    id: 'full-stack-developer',
    name: 'Full Stack Developer',
    description: 'Badge lie aux competences frontend et backend.',
    rule: '2 projets valides avec plusieurs technologies',
    iconUrl: '',
    iconFallback: 'FS',
    tone: 'green',
    target: 2,
    current: (stats) => stats.validatedProjects,
  },
  {
    id: 'security-aware',
    name: 'Security Aware',
    description: 'Badge lie aux bonnes pratiques de securite.',
    rule: '1 projet valide documente',
    iconUrl: '',
    iconFallback: 'SA',
    tone: 'red',
    target: 1,
    current: (stats) => stats.validatedProjectsWithLinks,
  },
  {
    id: 'ai-data',
    name: 'AI / Data',
    description: 'Badge lie aux projets IA ou Data Science.',
    rule: '1 projet ou activite de type data valide',
    iconUrl: '',
    iconFallback: 'AI',
    tone: 'orange',
    target: 1,
    current: (stats) => stats.dataSignals,
  },
];

const studentProfileSelect = {
  id: true,
  userId: true,
  apogeeCode: true,
  cne: true,
  major: true,
  level: true,
  birthDate: true,
  address: true,
  city: true,
  bio: true,
  careerObjective: true,
  linkedinUrl: true,
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      profilePicture: true,
      accountStatus: true,
      createdAt: true,
      lastLoginAt: true,
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
    select: {
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
        },
      },
    },
  },
  portfolio: {
    select: {
      id: true,
      title: true,
      publicSlug: true,
      description: true,
      visibility: true,
      status: true,
      targetDomain: true,
      generatedAt: true,
      updatedAt: true,
    },
  },
};

const studentDashboardSelect = {
  id: true,
  userId: true,
  major: true,
  level: true,
  city: true,
  bio: true,
  careerObjective: true,
  linkedinUrl: true,
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      profilePicture: true,
      accountStatus: true,
      createdAt: true,
      lastLoginAt: true,
    },
  },
  portfolio: {
    select: {
      id: true,
      title: true,
      publicSlug: true,
      visibility: true,
      status: true,
      targetDomain: true,
      updatedAt: true,
    },
  },
  projects: {
    orderBy: [{ submittedAt: 'desc' }, { createdAt: 'desc' }],
    take: 4,
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      validationStatus: true,
      visibility: true,
      githubUrl: true,
      youtubeUrl: true,
      createdAt: true,
      submittedAt: true,
      technologies: {
        select: {
          technology: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  },
  internships: {
    orderBy: [{ endDate: 'desc' }, { startDate: 'desc' }],
    take: 4,
    select: {
      id: true,
      hostOrganization: true,
      validationStatus: true,
      visibility: true,
      startDate: true,
      endDate: true,
    },
  },
  activities: {
    orderBy: [{ endDate: 'desc' }, { startDate: 'desc' }],
    take: 4,
    select: {
      id: true,
      title: true,
      type: true,
      organization: true,
      visibility: true,
      startDate: true,
      endDate: true,
    },
  },
};

const formatFullName = (user) => `${user.firstName} ${user.lastName}`.trim();

const formatShortMonth = (value) => {
  if (!value) return null;

  return new Intl.DateTimeFormat('fr-FR', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
};

const mapProjectTypeLabel = (type) => PROJECT_TYPE_LABELS[type] || type;

const safeNumber = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
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

const buildProfileCompletion = (student) => {
  const checks = [
    Boolean(student.user.firstName),
    Boolean(student.user.lastName),
    Boolean(student.user.email),
    Boolean(student.user.phone),
    Boolean(student.major),
    Boolean(student.level),
    Boolean(student.city),
    Boolean(student.bio),
    Boolean(student.linkedinUrl),
    student.academicPaths.length > 0,
    student.studentSkills.length > 0,
    Boolean(student.portfolio),
  ];

  const completedFields = checks.filter(Boolean).length;
  const totalFields = checks.length;

  return {
    completionRate: Math.round((completedFields / totalFields) * 100),
    completedFields,
    totalFields,
  };
};

const buildCredibility = (stats, profileCompletionRate) => {
  const details = [
    {
      label: 'Profil',
      value: Math.min(20, Math.round(profileCompletionRate / 5)),
    },
    {
      label: 'Projets',
      value: Math.min(20, stats.validatedProjects * 5),
    },
    {
      label: 'Stages',
      value: Math.min(20, stats.validatedInternships * 10),
    },
    {
      label: 'Badges',
      value: Math.min(20, stats.badgesCount * 5),
    },
    {
      label: 'Recommandations',
      value: Math.min(20, stats.recommendationsCount * 5),
    },
  ];

  const score = details.reduce((total, item) => total + item.value, 0);

  let label = 'Debutant';
  if (score >= 80) label = 'Excellent';
  else if (score >= 60) label = 'Solide';
  else if (score >= 40) label = 'En progression';

  return { score, label, details };
};

const buildBadges = (stats) =>
  BADGE_CATALOG.map((badge) => {
    const current = badge.current(stats);
    const isObtained = current >= badge.target;

    return {
      id: badge.id,
      name: badge.name,
      description: badge.description,
      rule: badge.rule,
      iconUrl: badge.iconUrl,
      iconFallback: badge.iconFallback,
      tone: badge.tone,
      isObtained,
      obtainedAt: isObtained ? formatShortMonth(stats.referenceDate) : null,
      progress: {
        current: Math.min(current, badge.target),
        target: badge.target,
      },
      date: isObtained ? formatShortMonth(stats.referenceDate) : null,
    };
  });

const buildDashboardNotifications = (stats) => {
  const notifications = [];
  const now = new Date().toISOString();

  if (stats.pendingProjects > 0) {
    notifications.push({
      id: 'pending-projects',
      title: 'Validation en attente',
      message: `${stats.pendingProjects} projet(s) en attente de validation.`,
      type: 'VALIDATION',
      read: false,
      createdAt: now,
    });
  }

  if (stats.pendingInternships > 0) {
    notifications.push({
      id: 'pending-internships',
      title: 'Stage en attente',
      message: `${stats.pendingInternships} stage(s) en attente de validation.`,
      type: 'VALIDATION',
      read: false,
      createdAt: now,
    });
  }

  if (stats.badgesCount > 0) {
    notifications.push({
      id: 'student-badges',
      title: 'Badge debloque',
      message: `${stats.badgesCount} badge(s) deja obtenu(s) sur votre espace etudiant.`,
      type: 'BADGE',
      read: true,
      createdAt: now,
    });
  }

  if (stats.validatedProjects > 0) {
    notifications.push({
      id: 'validated-projects',
      title: 'Projet valide',
      message: `${stats.validatedProjects} projet(s) valide(s) peuvent enrichir votre portfolio.`,
      type: 'SUCCESS',
      read: true,
      createdAt: now,
    });
  }

  return notifications.slice(0, 4);
};

const toStudentNotificationType = (type) => {
  if (type === 'VALIDATION') return 'VALIDATION';
  if (type === 'ALERT') return 'ALERT';
  return 'INFO';
};

const buildTimeline = (student, stats) => {
  const events = [
    ...student.projects.map((project) => ({
      id: `project-${project.id}`,
      type: 'PROJECT',
      title: `Projet ${project.title}`,
      status: project.validationStatus,
      createdAt: project.submittedAt || project.createdAt,
      description: project.description,
    })),
    ...student.internships.map((internship) => ({
      id: `internship-${internship.id}`,
      type: 'INTERNSHIP',
      title: `Stage chez ${internship.hostOrganization}`,
      status: internship.validationStatus,
      createdAt: internship.endDate || internship.startDate,
      description: internship.hostOrganization,
    })),
    ...student.activities.map((activity) => ({
      id: `activity-${activity.id}`,
      type: 'ACTIVITY',
      title: activity.title,
      status: 'VISIBLE',
      createdAt: activity.endDate || activity.startDate,
      description: activity.organization,
    })),
  ]
    .filter((item) => item.createdAt)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return {
    items: events.slice(0, 12),
    summary: {
      total: events.length,
      pendingProjects: stats.pendingProjects,
      pendingInternships: stats.pendingInternships,
    },
  };
};

const mapStudentProfile = (student) => ({
  user: {
    id: student.user.id,
    firstName: student.user.firstName,
    lastName: student.user.lastName,
    fullName: formatFullName(student.user),
    email: student.user.email,
    phone: student.user.phone,
    profilePicture: student.user.profilePicture,
    accountStatus: student.user.accountStatus,
    createdAt: student.user.createdAt,
    lastLoginAt: student.user.lastLoginAt,
  },
  profile: {
    id: student.id,
    userId: student.userId,
    apogeeCode: student.apogeeCode,
    cne: student.cne,
    major: student.major,
    level: student.level,
    birthDate: student.birthDate,
    address: student.address,
    city: student.city,
    bio: student.bio,
    careerObjective: student.careerObjective,
    linkedinUrl: student.linkedinUrl,
  },
  academicPaths: student.academicPaths,
  skills: student.studentSkills.map((studentSkill) => ({
    id: studentSkill.id,
    masteryLevel: studentSkill.masteryLevel,
    skillSource: studentSkill.skillSource,
    updatedAt: studentSkill.updatedAt,
    skill: studentSkill.skill,
  })),
  portfolio: student.portfolio,
});

const mapDashboardProject = (project) => ({
  id: project.id,
  title: project.title,
  description: project.description,
  type: mapProjectTypeLabel(project.type),
  validationStatus: project.validationStatus,
  visibility: project.visibility,
  createdAt: project.createdAt,
  submittedAt: project.submittedAt,
  technologies: project.technologies.map((item) => item.technology.name),
  githubUrl: project.githubUrl,
  demoUrl: project.youtubeUrl,
});

const computeDashboardStats = async (student) => {
  const [
    projectCount,
    internshipCount,
    activityCount,
    certificateCount,
    recommendationLetterCount,
    recommendationCount,
    pendingProjectCount,
    pendingInternshipCount,
    pendingCertificateCount,
    pendingRecommendationLetterCount,
    pendingRecommendationCount,
    validatedProjectCount,
    validatedInternshipCount,
    multiTechProjectCount,
    projectWithLinksCount,
    hackathonActivityCount,
  ] = await Promise.all([
    prisma.project.count({ where: { studentId: student.id } }),
    prisma.internship.count({ where: { studentId: student.id } }),
    prisma.extracurricularActivity.count({ where: { studentId: student.id } }),
    prisma.certificate.count({
      where: {
        activity: {
          studentId: student.id,
        },
      },
    }),
    prisma.recommendationLetter.count({ where: { studentId: student.id } }),
    prisma.recommendation.count({ where: { studentId: student.id } }),
    prisma.project.count({
      where: {
        studentId: student.id,
        validationStatus: 'PENDING',
      },
    }),
    prisma.internship.count({
      where: {
        studentId: student.id,
        validationStatus: 'PENDING',
      },
    }),
    prisma.certificate.count({
      where: {
        validationStatus: 'PENDING',
        activity: {
          studentId: student.id,
        },
      },
    }),
    prisma.recommendationLetter.count({
      where: {
        studentId: student.id,
        validationStatus: 'PENDING',
      },
    }),
    prisma.recommendation.count({
      where: {
        studentId: student.id,
        status: 'PENDING',
      },
    }),
    prisma.project.count({
      where: {
        studentId: student.id,
        validationStatus: 'APPROVED',
      },
    }),
    prisma.internship.count({
      where: {
        studentId: student.id,
        validationStatus: 'APPROVED',
      },
    }),
    prisma.project.count({
      where: {
        studentId: student.id,
        technologies: {
          some: {},
        },
      },
    }),
    prisma.project.count({
      where: {
        studentId: student.id,
        OR: [{ githubUrl: { not: null } }, { youtubeUrl: { not: null } }],
      },
    }),
    prisma.extracurricularActivity.count({
      where: {
        studentId: student.id,
        type: 'HACKATHON',
      },
    }),
  ]);

  const baseStats = {
    totalProjects: projectCount,
    totalInternships: internshipCount,
    totalActivities: activityCount,
    totalCertificates: certificateCount,
    totalRecommendationLetters: recommendationLetterCount,
    recommendationsCount: recommendationCount,
    pendingProjects: pendingProjectCount,
    pendingInternships: pendingInternshipCount,
    pendingCertificates: pendingCertificateCount,
    pendingRecommendationLetters: pendingRecommendationLetterCount,
    pendingRecommendations: pendingRecommendationCount,
    validatedProjects: validatedProjectCount,
    validatedInternships: validatedInternshipCount,
    multiTechProjects: multiTechProjectCount,
    validatedProjectsWithLinks: projectWithLinksCount,
    hackathonActivities: hackathonActivityCount,
    dataSignals: hackathonActivityCount,
    referenceDate: new Date(),
  };

  const badges = buildBadges(baseStats);

  return {
    ...baseStats,
    badges,
    badgesCount: badges.filter((badge) => badge.isObtained).length,
  };
};

exports.getStudentProfile = async (userId) =>
  mapStudentProfile(await getStudentOrThrow(userId));

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
        careerObjective:
          payload.careerGoal ?? payload.careerObjective ?? student.careerObjective,
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
