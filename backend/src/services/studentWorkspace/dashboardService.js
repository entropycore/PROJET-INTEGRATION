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

exports.listBadges = async () => prisma.badge.findMany({ orderBy: { createdAt: 'desc' } });

exports.getDashboardExtras = async (userId) => {
  const profile = await getStudentOrThrow(userId);
  const [badges, timeline] = await Promise.all([
    exports.listBadges(),
    prisma.academicTimeline.findMany({
      where: { studentId: profile.id },
      orderBy: { startDate: 'desc' },
      take: 10,
    }),
  ]);

  return {
    credibilityScore: 0,
    profileCompletion: profile.bio && profile.linkedinUrl ? 80 : 40,
    badges,
    timeline,
  };
};

exports.createMediaPlaceholderId = () => crypto.randomUUID();
