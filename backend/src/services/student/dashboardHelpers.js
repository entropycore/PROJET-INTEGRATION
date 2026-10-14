'use strict';

const crypto = require('crypto');
const prisma = require('../../config/prisma');

const PROJECT_TYPE_LABELS = {
  MODULE: 'Module',
  INTEGRATION: 'Intégration',
  HACKATHON: 'Hackathon',
  PERSONAL: 'Personnel',
  INTERNSHIP: 'Stage',
};

const DEFAULT_BADGE_RULES = [
  {
    key: 'web-developer',
    name: 'Web Developer',
    description: 'Badge pour les étudiants actifs en développement web.',
    rule: '3 projets validés',
    iconUrl: '',
    iconFallback: 'WD',
    tone: 'blue',
    target: 3,
    current: (stats) => stats.validatedProjects,
  },
  {
    key: 'devops-explorer',
    name: 'DevOps Explorer',
    description: 'Badge lié aux outils DevOps.',
    rule: '2 projets avec plusieurs technologies',
    iconUrl: '',
    iconFallback: 'DX',
    tone: 'cyan',
    target: 2,
    current: (stats) => stats.multiTechProjects,
  },
  {
    key: 'hackathon-participant',
    name: 'Hackathon Participant',
    description: 'Badge pour participation aux événements.',
    rule: '1 activité de type hackathon',
    iconUrl: '',
    iconFallback: 'HP',
    tone: 'purple',
    target: 1,
    current: (stats) => stats.hackathonActivities,
  },
  {
    key: 'full-stack-developer',
    name: 'Full Stack Developer',
    description: 'Badge lié aux compétences frontend et backend.',
    rule: '2 projets validés avec plusieurs technologies',
    iconUrl: '',
    iconFallback: 'FS',
    tone: 'green',
    target: 2,
    current: (stats) => stats.validatedProjects,
  },
  {
    key: 'security-aware',
    name: 'Security Aware',
    description: 'Badge lié aux bonnes pratiques de sécurité.',
    rule: '1 projet validé documenté',
    iconUrl: '',
    iconFallback: 'SA',
    tone: 'red',
    target: 1,
    current: (stats) => stats.validatedProjectsWithLinks,
  },
  {
    key: 'ai-data',
    name: 'AI / Data',
    description: 'Badge lié aux projets IA ou Data Science.',
    rule: '1 projet ou activité de type data validé',
    iconUrl: '',
    iconFallback: 'AI',
    tone: 'orange',
    target: 1,
    current: (stats) => stats.dataSignals,
  },
];

const DEFAULT_BADGES = DEFAULT_BADGE_RULES.map(
  ({ name, description, rule, iconUrl, tone }) => ({
    name,
    description,
    rule,
    iconUrl,
    tone,
  }),
);

const normalizeBadgeName = (name) =>
  String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const DEFAULT_BADGE_RULES_BY_NAME = new Map(
  DEFAULT_BADGE_RULES.map((rule) => [normalizeBadgeName(rule.name), rule]),
);

const isStructureMissingError = (err) =>
  err?.code === 'P2021' ||
  err?.code === 'P2022' ||
  err?.meta?.code === '42P01' ||
  err?.meta?.code === '42703';

const safeInt = (value, fallback = 0) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const clampProgress = (value, target) => Math.max(0, Math.min(safeInt(value), target));

const buildIconFallback = (name) => {
  const initials = String(name || '')
    .split(/[^A-Za-z0-9]+/)
    .map((part) => part.trim().charAt(0))
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return initials || '*';
};

const getBadgeRule = (badge) =>
  DEFAULT_BADGE_RULES_BY_NAME.get(normalizeBadgeName(badge.name)) || {
    key: normalizeBadgeName(badge.name) || badge.id,
    target: 1,
    current: () => 0,
  };

const buildDefaultBadgeFallback = () =>
  DEFAULT_BADGES.map((badge) => ({
    ...badge,
    id: normalizeBadgeName(badge.name),
    createdAt: null,
    updatedAt: null,
  }));

const ensureDefaultBadges = async () => {
  if (typeof prisma.badge?.findMany !== 'function') {
    return;
  }

  const existingBadges = await prisma.badge.findMany({
    where: {
      name: {
        in: DEFAULT_BADGES.map((badge) => badge.name),
      },
    },
    select: { name: true },
  });
  const existingNames = new Set(existingBadges.map((badge) => badge.name));
  const missingBadges = DEFAULT_BADGES.filter((badge) => !existingNames.has(badge.name));

  await Promise.all(
    missingBadges.map((badge) =>
      prisma.badge
        .create({
          data: badge,
        })
        .catch((err) => {
          if (err?.code === 'P2002') return null;
          throw err;
        }),
    ),
  );
};

const loadBadgeCatalog = async () => {
  if (typeof prisma.badge?.findMany !== 'function') {
    return buildDefaultBadgeFallback();
  }

  try {
    await ensureDefaultBadges();

    const badges = await prisma.badge.findMany({
      orderBy: [{ createdAt: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        description: true,
        rule: true,
        iconUrl: true,
        tone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return badges.length ? badges : buildDefaultBadgeFallback();
  } catch (err) {
    if (isStructureMissingError(err)) {
      return buildDefaultBadgeFallback();
    }

    throw err;
  }
};

const findStudentBadgeAward = async (studentId, badgeId) => {
  const rows = await prisma.$queryRaw`
    SELECT
      "id_student_badge" AS "id",
      "is_obtained" AS "isObtained",
      "obtained_at" AS "obtainedAt"
    FROM "student_badges"
    WHERE "student_id" = ${studentId}
      AND "badge_id" = ${badgeId}
    LIMIT 1
  `;

  return rows[0] || null;
};

const syncStudentBadgeAward = async ({
  studentId,
  badgeId,
  isObtained,
  progressCurrent,
  progressTarget,
  referenceDate,
}) => {
  try {
    const existing = await findStudentBadgeAward(studentId, badgeId);
    const now = new Date();
    const hasExistingAward = Boolean(existing?.obtainedAt || existing?.isObtained);
    const nextIsObtained = hasExistingAward || isObtained;
    const nextObtainedAt = existing?.obtainedAt || (isObtained ? referenceDate : null);

    if (existing) {
      await prisma.$executeRaw`
        UPDATE "student_badges"
        SET
          "is_obtained" = ${nextIsObtained},
          "progress_current" = ${progressCurrent},
          "progress_target" = ${progressTarget},
          "obtained_at" = ${nextObtainedAt},
          "last_evaluated_at" = ${now},
          "updated_at" = ${now}
        WHERE "id_student_badge" = ${existing.id}
      `;
    } else {
      await prisma.$executeRaw`
        INSERT INTO "student_badges" (
          "id_student_badge",
          "student_id",
          "badge_id",
          "is_obtained",
          "progress_current",
          "progress_target",
          "obtained_at",
          "last_evaluated_at",
          "created_at",
          "updated_at"
        )
        VALUES (
          ${crypto.randomUUID()},
          ${studentId},
          ${badgeId},
          ${nextIsObtained},
          ${progressCurrent},
          ${progressTarget},
          ${nextObtainedAt},
          ${now},
          ${now},
          ${now}
        )
      `;
    }

    return {
      isObtained: nextIsObtained,
      obtainedAt: nextObtainedAt,
    };
  } catch (err) {
    if (isStructureMissingError(err)) {
      return null;
    }

    throw err;
  }
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

  let label = 'Débutant';
  if (score >= 80) label = 'Excellent';
  else if (score >= 60) label = 'Solide';
  else if (score >= 40) label = 'En progression';

  return { score, label, details };
};

const buildBadges = async (studentId, stats) => {
  const badgeCatalog = await loadBadgeCatalog();
  const badges = [];

  for (const badge of badgeCatalog) {
    const rule = getBadgeRule(badge);
    const target = Math.max(1, safeInt(rule.target, 1));
    const current = clampProgress(rule.current(stats), target);
    const computedIsObtained = current >= target;
    const award = await syncStudentBadgeAward({
      studentId,
      badgeId: badge.id,
      isObtained: computedIsObtained,
      progressCurrent: current,
      progressTarget: target,
      referenceDate: stats.referenceDate,
    });
    const isObtained = award?.isObtained ?? computedIsObtained;
    const obtainedAt = award?.obtainedAt || (isObtained ? stats.referenceDate : null);

    badges.push({
      id: badge.id || rule.key,
      name: badge.name,
      description: badge.description,
      rule: badge.rule,
      iconUrl: badge.iconUrl || '',
      iconFallback: badge.iconFallback || buildIconFallback(badge.name),
      tone: badge.tone || 'blue',
      isObtained,
      obtainedAt: obtainedAt ? formatShortMonth(obtainedAt) : null,
      progress: {
        current,
        target,
      },
      date: obtainedAt ? formatShortMonth(obtainedAt) : null,
    });
  }

  return badges;
};

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
      title: 'Badge débloqué',
      message: `${stats.badgesCount} badge(s) déjà obtenu(s) sur votre espace étudiant.`,
      type: 'BADGE',
      read: true,
      createdAt: now,
    });
  }

  if (stats.validatedProjects > 0) {
    notifications.push({
      id: 'validated-projects',
      title: 'Projet validé',
      message: `${stats.validatedProjects} projet(s) validé(s) peuvent enrichir votre portfolio.`,
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

  const badges = await buildBadges(student.id, baseStats);

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
