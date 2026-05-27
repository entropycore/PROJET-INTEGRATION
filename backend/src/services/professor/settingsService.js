'use strict';

const bcrypt = require('bcrypt');
const prisma = require('../../config/prisma');
const { getProfessorByUserId } = require('./data');
const {
  buildProfessorPreferencesPayload,
  ensureBoolean,
  mergeProfessorSettings,
  normalizeProfileVisibility,
} = require('./settingsHelpers');

const professorSettingsSelect = {
  id: true,
  user: {
    select: {
      id: true,
      preferences: true,
    },
  },
};

const getProfessorSettings = async (userId) => {
  const professor = await getProfessorByUserId(userId, professorSettingsSelect);
  return mergeProfessorSettings(professor.user.preferences);
};

const updateProfessorSettingsPreferences = async (userId, updater) => {
  const professor = await getProfessorByUserId(userId, professorSettingsSelect);
  const currentSettings = mergeProfessorSettings(professor.user.preferences);
  const nextSettings = updater(currentSettings);
  const nextPreferences = buildProfessorPreferencesPayload(
    professor.user.preferences,
    nextSettings,
  );

  await prisma.user.update({
    where: { id: professor.user.id },
    data: { preferences: nextPreferences },
  });

  return nextSettings;
};

const updateProfessorSettingsPassword = async (userId, payload = {}) => {
  const professor = await getProfessorByUserId(userId);
  const currentPassword = String(payload.currentPassword || '');
  const newPassword = String(payload.newPassword || '');
  const confirmPassword =
    payload.confirmPassword === undefined
      ? undefined
      : String(payload.confirmPassword || '');

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
    where: { id: professor.user.id },
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

const updateProfessorSettingsPrivacy = async (userId, payload = {}) => {
  const settings = await updateProfessorSettingsPreferences(
    userId,
    (currentSettings) => ({
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
    }),
  );

  return settings.privacy;
};

const updateProfessorSettingsNotifications = async (userId, payload = {}) => {
  const settings = await updateProfessorSettingsPreferences(
    userId,
    (currentSettings) => ({
      ...currentSettings,
      notifications: {
        email:
          payload.email === undefined
            ? currentSettings.notifications.email
            : ensureBoolean(
                payload.email,
                'INVALID_NOTIFICATION_BOOLEAN_VALUE',
              ),
        push:
          payload.push === undefined
            ? currentSettings.notifications.push
            : ensureBoolean(
                payload.push,
                'INVALID_NOTIFICATION_BOOLEAN_VALUE',
              ),
        validationAssignments:
          payload.validationAssignments === undefined
            ? currentSettings.notifications.validationAssignments
            : ensureBoolean(
                payload.validationAssignments,
                'INVALID_NOTIFICATION_BOOLEAN_VALUE',
              ),
        validationUpdates:
          payload.validationUpdates === undefined
            ? currentSettings.notifications.validationUpdates
            : ensureBoolean(
                payload.validationUpdates,
                'INVALID_NOTIFICATION_BOOLEAN_VALUE',
              ),
        weeklyDigest:
          payload.weeklyDigest === undefined
            ? currentSettings.notifications.weeklyDigest
            : ensureBoolean(
                payload.weeklyDigest,
                'INVALID_NOTIFICATION_BOOLEAN_VALUE',
              ),
      },
    }),
  );

  return settings.notifications;
};

module.exports = {
  getProfessorSettings,
  updateProfessorSettingsNotifications,
  updateProfessorSettingsPassword,
  updateProfessorSettingsPrivacy,
};
