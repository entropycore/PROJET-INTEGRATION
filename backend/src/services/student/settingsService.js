'use strict';

const bcrypt = require('bcrypt');
const prisma = require('../../config/prisma');
const {
  buildStudentPreferencesPayload,
  ensureBoolean,
  mergeStudentSettings,
  normalizeProfileVisibility,
} = require('./settingsHelpers');
const { getStudentOrThrow } = require('./studentData');

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

const getStudentSettings = async (userId) => {
  const student = await getStudentOrThrow(userId);
  const user = await prisma.user.findUnique({
    where: { id: student.user.id },
    select: {
      preferences: true,
    },
  });

  return mergeStudentSettings(user?.preferences);
};

const updateStudentSettingsPassword = async (userId, payload = {}) => {
  await getStudentOrThrow(userId);

  const currentPassword = String(payload.currentPassword || '');
  const newPassword = String(payload.newPassword || '');
  const confirmPassword =
    payload.confirmPassword === undefined ? undefined : String(payload.confirmPassword || '');

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

const updateStudentSettingsPrivacy = async (userId, payload = {}) => {
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

const updateStudentSettingsNotifications = async (userId, payload = {}) => {
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

module.exports = {
  getStudentSettings,
  updateStudentSettingsNotifications,
  updateStudentSettingsPassword,
  updateStudentSettingsPrivacy,
};
