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

exports.listValidators = async () => {
  const professors = await prisma.professor.findMany({
    include: { user: true },
    orderBy: { user: { lastName: 'asc' } },
  });

  return professors.map((professor) => ({
    id: professor.id,
    fullName: fullName(professor.user),
    email: professor.user.email,
    department: professor.department,
    specialty: professor.specialty,
    grade: professor.grade,
  }));
};
