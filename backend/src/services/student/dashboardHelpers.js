'use strict';

const prisma = require('../../config/prisma');

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

const formatFullName = (user) => `${user.firstName} ${user.lastName}`.trim();

const formatShortMonth = (value) => {
  if (!value) return null;

  return new Intl.DateTimeFormat('fr-FR', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
};

const mapProjectTypeLabel = (type) => PROJECT_TYPE_LABELS[type] || type;

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

module.exports = {
  buildCredibility,
  buildDashboardNotifications,
  buildProfileCompletion,
  buildTimeline,
  computeDashboardStats,
  formatFullName,
  mapDashboardProject,
  mapStudentProfile,
  toStudentNotificationType,
};
