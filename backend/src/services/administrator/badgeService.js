'use strict';

const prisma = require('../../config/prisma');
const { badgeSelect } = require('./serviceSelects');
const {
  buildPagination,
  isStructureMissingError,
  normalizeOptionalText,
  normalizePagination,
  normalizeRequiredText,
} = require('./serviceUtils');

const buildBadgeSearch = (search) => {
  if (!search) {
    return undefined;
  }

  return [
    { name: { contains: search, mode: 'insensitive' } },
    { description: { contains: search, mode: 'insensitive' } },
    { rule: { contains: search, mode: 'insensitive' } },
  ];
};

const normalizeBadgeTone = (value) => normalizeRequiredText(value) || 'blue';
const hasBadgeFeature = () => typeof prisma.badge?.findMany === 'function';

const ensureBadgeFeatureAvailable = () => {
  if (!hasBadgeFeature()) {
    throw new Error('BADGE_FEATURE_UNAVAILABLE');
  }

  return prisma.badge;
};

const mapBadgeItem = (badge) => ({
  id: badge.id,
  name: badge.name,
  description: badge.description,
  rule: badge.rule,
  iconUrl: badge.iconUrl || '',
  iconFallback: '🏅',
  tone: badge.tone || 'blue',
  attributionCount: 0,
  createdAt: badge.createdAt,
  updatedAt: badge.updatedAt,
});

const getBadgeOrThrow = async (badgeId) => {
  let badge;

  try {
    badge = await ensureBadgeFeatureAvailable().findUnique({
      where: { id: badgeId },
      select: badgeSelect,
    });
  } catch (err) {
    if (isStructureMissingError(err)) {
      throw new Error('BADGE_FEATURE_UNAVAILABLE', { cause: err });
    }

    throw err;
  }

  if (!badge) {
    throw new Error('BADGE_NOT_FOUND');
  }

  return badge;
};

const ensureUniqueBadgeName = async (name, excludedBadgeId = null) => {
  try {
    const existingBadge = await ensureBadgeFeatureAvailable().findFirst({
      where: {
        name,
        ...(excludedBadgeId ? { NOT: { id: excludedBadgeId } } : {}),
      },
      select: { id: true },
    });

    if (existingBadge) {
      throw new Error('BADGE_NAME_ALREADY_EXISTS');
    }
  } catch (err) {
    if (isStructureMissingError(err)) {
      throw new Error('BADGE_FEATURE_UNAVAILABLE', { cause: err });
    }

    throw err;
  }
};

const listBadges = async ({ page = 1, limit = 10, search } = {}) => {
  const { skip, page: safePage, limit: safeLimit } = normalizePagination(page, limit);

  if (!hasBadgeFeature()) {
    return {
      items: [],
      pagination: buildPagination(safePage, safeLimit, 0),
    };
  }

  const where = search ? { OR: buildBadgeSearch(search) } : undefined;

  try {
    const [total, badges] = await Promise.all([
      prisma.badge.count({ where }),
      prisma.badge.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { name: 'asc' }],
        skip,
        take: safeLimit,
        select: badgeSelect,
      }),
    ]);

    return {
      items: badges.map(mapBadgeItem),
      pagination: buildPagination(safePage, safeLimit, total),
    };
  } catch (err) {
    if (isStructureMissingError(err)) {
      return {
        items: [],
        pagination: buildPagination(safePage, safeLimit, 0),
      };
    }

    throw err;
  }
};

const createBadge = async (payload = {}) => {
  const name = normalizeRequiredText(payload.name);
  const rule = normalizeRequiredText(payload.rule);

  if (!name || !rule) {
    throw new Error('BADGE_REQUIRED_FIELDS');
  }

  await ensureUniqueBadgeName(name);

  try {
    const badge = await ensureBadgeFeatureAvailable().create({
      data: {
        name,
        description: normalizeOptionalText(payload.description),
        rule,
        iconUrl: normalizeOptionalText(payload.iconUrl),
        tone: normalizeBadgeTone(payload.tone),
      },
      select: badgeSelect,
    });

    return mapBadgeItem(badge);
  } catch (err) {
    if (isStructureMissingError(err)) {
      throw new Error('BADGE_FEATURE_UNAVAILABLE', { cause: err });
    }

    if (err?.code === 'P2002') {
      throw new Error('BADGE_NAME_ALREADY_EXISTS', { cause: err });
    }

    throw err;
  }
};

const updateBadge = async (badgeId, payload = {}) => {
  const existingBadge = await getBadgeOrThrow(badgeId);
  const nextName = Object.prototype.hasOwnProperty.call(payload, 'name')
    ? normalizeRequiredText(payload.name)
    : existingBadge.name;
  const nextRule = Object.prototype.hasOwnProperty.call(payload, 'rule')
    ? normalizeRequiredText(payload.rule)
    : existingBadge.rule;

  if (!nextName || !nextRule) {
    throw new Error('BADGE_REQUIRED_FIELDS');
  }

  await ensureUniqueBadgeName(nextName, badgeId);

  try {
    const updatedBadge = await ensureBadgeFeatureAvailable().update({
      where: { id: badgeId },
      data: {
        name: nextName,
        description: Object.prototype.hasOwnProperty.call(payload, 'description')
          ? normalizeOptionalText(payload.description)
          : existingBadge.description,
        rule: nextRule,
        iconUrl: Object.prototype.hasOwnProperty.call(payload, 'iconUrl')
          ? normalizeOptionalText(payload.iconUrl)
          : existingBadge.iconUrl,
        tone: Object.prototype.hasOwnProperty.call(payload, 'tone')
          ? normalizeBadgeTone(payload.tone)
          : existingBadge.tone,
      },
      select: badgeSelect,
    });

    return mapBadgeItem(updatedBadge);
  } catch (err) {
    if (isStructureMissingError(err)) {
      throw new Error('BADGE_FEATURE_UNAVAILABLE', { cause: err });
    }

    if (err?.code === 'P2025') {
      throw new Error('BADGE_NOT_FOUND', { cause: err });
    }

    if (err?.code === 'P2002') {
      throw new Error('BADGE_NAME_ALREADY_EXISTS', { cause: err });
    }

    throw err;
  }
};

const deleteBadge = async (badgeId) => {
  await getBadgeOrThrow(badgeId);

  try {
    await ensureBadgeFeatureAvailable().delete({ where: { id: badgeId } });
  } catch (err) {
    if (isStructureMissingError(err)) {
      throw new Error('BADGE_FEATURE_UNAVAILABLE', { cause: err });
    }

    if (err?.code === 'P2025') {
      throw new Error('BADGE_NOT_FOUND', { cause: err });
    }

    throw err;
  }

  return {
    id: badgeId,
    deleted: true,
  };
};

module.exports = {
  createBadge,
  deleteBadge,
  listBadges,
  updateBadge,
};
