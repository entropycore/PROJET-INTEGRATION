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

exports.updatePassword = async (userId, payload = {}) => {
  const currentPassword = String(payload.currentPassword || '');
  const newPassword = String(payload.newPassword || '');
  const confirmPassword = String(payload.confirmPassword || '');

  if (!currentPassword || !newPassword) throw serviceError('MISSING_PASSWORD_FIELDS', 400);
  if (newPassword.length < 8) throw serviceError('NEW_PASSWORD_TOO_SHORT', 400);
  if (confirmPassword && newPassword !== confirmPassword) {
    throw serviceError('PASSWORD_CONFIRMATION_MISMATCH', 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, passwordHash: true },
  });

  if (!user) throw serviceError('USER_NOT_FOUND', 404);

  const currentPasswordMatches = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!currentPasswordMatches) throw serviceError('CURRENT_PASSWORD_INVALID', 400);

  const samePassword = await bcrypt.compare(newPassword, user.passwordHash);
  if (samePassword) throw serviceError('NEW_PASSWORD_SAME_AS_CURRENT', 400);

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    }),
    prisma.refreshTokenSession.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true, revokedAt: new Date() },
    }),
  ]);

  return { updated: true };
};

const updatePreferencesSection = async (userId, section, values) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, preferences: true },
  });

  if (!user) throw serviceError('USER_NOT_FOUND', 404);

  const preferences = normalizePreferences(user.preferences);
  const nextPreferences = {
    ...preferences,
    schema_version: preferences.schema_version || 1,
    [section]: {
      ...(isPlainObject(preferences[section]) ? preferences[section] : {}),
      ...values,
    },
  };

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { preferences: nextPreferences },
    select: { preferences: true },
  });

  return updatedUser.preferences;
};

exports.updatePrivacyPreferences = async (userId, payload = {}) => {
  const profileVisibility = String(payload.profileVisibility || 'PUBLIC')
    .trim()
    .toUpperCase()
    .replace(/-/g, '_');

  if (!VALID_VISIBILITIES.has(profileVisibility)) {
    throw serviceError('INVALID_PROFILE_VISIBILITY', 400);
  }

  const values = {
    profileVisibility,
    showEmail: requireBoolean(payload.showEmail, 'INVALID_PRIVACY_BOOLEAN_VALUE'),
    showPhone: requireBoolean(payload.showPhone, 'INVALID_PRIVACY_BOOLEAN_VALUE'),
  };

  return updatePreferencesSection(userId, 'privacy', values);
};

exports.updateNotificationPreferences = async (userId, payload = {}) => {
  const values = {
    email: requireBoolean(payload.email, 'INVALID_NOTIFICATION_BOOLEAN_VALUE'),
    push: requireBoolean(payload.push, 'INVALID_NOTIFICATION_BOOLEAN_VALUE'),
    validationUpdates: requireBoolean(
      payload.validationUpdates,
      'INVALID_NOTIFICATION_BOOLEAN_VALUE'
    ),
    recommendations: requireBoolean(payload.recommendations, 'INVALID_NOTIFICATION_BOOLEAN_VALUE'),
  };

  return updatePreferencesSection(userId, 'notifications', values);
};
