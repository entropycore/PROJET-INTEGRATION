'use strict';

const isStructureMissingError = (err) => err?.code === 'P2021' || err?.code === 'P2022';

const safeCount = async (runner) => {
  try {
    return await runner();
  } catch (err) {
    if (isStructureMissingError(err)) {
      return 0;
    }

    throw err;
  }
};

const safeAggregateCount = async (runner) => {
  try {
    return await runner();
  } catch (err) {
    if (isStructureMissingError(err)) {
      return 0;
    }

    throw err;
  }
};

const safeReadWithFallback = async (primaryRunner, fallbackRunner, defaultValue) => {
  try {
    return await primaryRunner();
  } catch (err) {
    if (!isStructureMissingError(err)) {
      throw err;
    }

    if (!fallbackRunner) {
      return defaultValue;
    }

    try {
      return await fallbackRunner();
    } catch (fallbackErr) {
      if (isStructureMissingError(fallbackErr)) {
        return defaultValue;
      }

      throw fallbackErr;
    }
  }
};

const normalizePagination = (page = 1, limit = 10) => {
  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  const safeLimit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 50) : 10;

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
};

const buildPagination = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});

const paginateItems = (items, page = 1, limit = 10) => {
  const { page: safePage, limit: safeLimit, skip } = normalizePagination(page, limit);

  return {
    items: items.slice(skip, skip + safeLimit),
    pagination: buildPagination(safePage, safeLimit, items.length),
  };
};

const normalizeSearch = (value) =>
  String(value || '')
    .trim()
    .toLowerCase();

const normalizeRequiredText = (value) => (typeof value === 'string' ? value.trim() : '');

const normalizeOptionalText = (value) => {
  if (typeof value !== 'string') {
    return value == null ? null : value;
  }

  const trimmed = value.trim();
  return trimmed || null;
};

const readTextValue = (payload, names) => {
  for (const name of names) {
    if (typeof payload?.[name] === 'string') {
      return payload[name].trim() || null;
    }
  }

  return null;
};

const stripUndefined = (payload) =>
  Object.fromEntries(Object.entries(payload).filter(([, value]) => typeof value !== 'undefined'));

module.exports = {
  buildPagination,
  isStructureMissingError,
  normalizeOptionalText,
  normalizePagination,
  normalizeRequiredText,
  normalizeSearch,
  paginateItems,
  readTextValue,
  safeAggregateCount,
  safeCount,
  safeReadWithFallback,
  stripUndefined,
};
