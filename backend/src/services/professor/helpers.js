'use strict';

const VALIDATION_TYPES = ['PROJECT', 'INTERNSHIP'];
const VALIDATION_STATUSES = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CHANGES_REQUESTED',
];

const formatFullName = (user) =>
  `${user?.firstName || ''} ${user?.lastName || ''}`.trim();

const normalizeValidationType = (value) => {
  if (!value || value === 'ALL') return null;

  const type = String(value).trim().toUpperCase().replace(/-/g, '_');
  if (!VALIDATION_TYPES.includes(type)) {
    throw new Error('UNSUPPORTED_PROFESSOR_VALIDATION_TYPE');
  }

  return type;
};

const normalizeValidationStatus = (value) => {
  if (!value || value === 'ALL') return null;

  const status = String(value).trim().toUpperCase();
  if (!VALIDATION_STATUSES.includes(status)) {
    throw new Error('UNSUPPORTED_PROFESSOR_VALIDATION_STATUS');
  }

  return status;
};

const readComment = (payload = {}) => {
  const value = payload.comment || payload.feedback || payload.reason || '';
  return String(value).trim() || null;
};

const normalizeSearch = (value) =>
  String(value || '')
    .trim()
    .toLowerCase();

const sortByDateDesc = (items) =>
  [...items].sort((left, right) => {
    const leftDate = new Date(
      left.submittedAt || left.createdAt || 0,
    ).getTime();
    const rightDate = new Date(
      right.submittedAt || right.createdAt || 0,
    ).getTime();

    return rightDate - leftDate;
  });

module.exports = {
  formatFullName,
  normalizeSearch,
  normalizeValidationStatus,
  normalizeValidationType,
  readComment,
  sortByDateDesc,
};
