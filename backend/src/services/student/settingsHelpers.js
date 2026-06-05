'use strict';

const STUDENT_SETTINGS_DEFAULTS = Object.freeze({
  schema_version: 1,
  privacy: {
    profileVisibility: 'PUBLIC',
    showEmail: false,
    showPhone: false,
  },
  notifications: {
    email: true,
    push: false,
    validationUpdates: true,
    recommendations: true,
  },
});

const ALLOWED_PROFILE_VISIBILITY = new Set(['PUBLIC', 'PRIVATE', 'CONNECTIONS']);

const cloneDefaultStudentSettings = () => JSON.parse(JSON.stringify(STUDENT_SETTINGS_DEFAULTS));

const asPlainObject = (value) => (value && typeof value === 'object' && !Array.isArray(value) ? value : {});

const mergeStudentSettings = (rawPreferences) => {
  const defaults = cloneDefaultStudentSettings();
  const source = asPlainObject(rawPreferences);

  return {
    ...defaults,
    ...source,
    schema_version: Number(source.schema_version) || defaults.schema_version,
    privacy: {
      ...defaults.privacy,
      ...asPlainObject(source.privacy),
    },
    notifications: {
      ...defaults.notifications,
      ...asPlainObject(source.notifications),
    },
  };
};

const buildStudentPreferencesPayload = (currentPreferences, settings) => ({
  ...asPlainObject(currentPreferences),
  schema_version: settings.schema_version,
  privacy: settings.privacy,
  notifications: settings.notifications,
});

const ensureBoolean = (value, errorCode) => {
  if (typeof value !== 'boolean') {
    throw new Error(errorCode);
  }

  return value;
};

const normalizeProfileVisibility = (value) => {
  const normalized = String(value || '')
    .trim()
    .toUpperCase();

  if (!ALLOWED_PROFILE_VISIBILITY.has(normalized)) {
    throw new Error('INVALID_PROFILE_VISIBILITY');
  }

  return normalized;
};

module.exports = {
  buildStudentPreferencesPayload,
  ensureBoolean,
  mergeStudentSettings,
  normalizeProfileVisibility,
};
