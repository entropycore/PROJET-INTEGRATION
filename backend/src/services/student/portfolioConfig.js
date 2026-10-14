'use strict';

const DEFAULT_THEME = 'modern-academic';

const SUPPORTED_THEMES = new Set([
  'modern-academic',
  'code-dark',
  'pixel-tech',
  'neo-brutalist',
]);

const DEFAULT_SECTIONS = [
  'skills',
  'softSkills',
  'badges',
  'academicPaths',
  'githubActivity',
  'projects',
  'internships',
  'activities',
  'recommendationLetters',
  'recommendations',
];

const ITEM_KEYS = [
  'projects',
  'internships',
  'activities',
  'recommendationLetters',
  'recommendations',
];

const asPlainObject = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {};

const normalizeTheme = (theme) => {
  const normalizedTheme = String(theme || DEFAULT_THEME).trim();

  if (!SUPPORTED_THEMES.has(normalizedTheme)) {
    throw new Error('INVALID_PORTFOLIO_THEME');
  }

  return normalizedTheme;
};

const normalizeSections = (sections) => {
  if (!Array.isArray(sections)) {
    return [...DEFAULT_SECTIONS];
  }

  const normalizedSections = sections
    .map((section) => String(section || '').trim())
    .filter((section) => DEFAULT_SECTIONS.includes(section));

  return [...new Set(normalizedSections)];
};

const normalizeItems = (items) => {
  const source = asPlainObject(items);

  return ITEM_KEYS.reduce((result, key) => {
    const values = Array.isArray(source[key]) ? source[key] : [];

    result[key] = [
      ...new Set(
        values
          .map((value) => String(value || '').trim())
          .filter(Boolean),
      ),
    ];

    return result;
  }, {});
};

const normalizePortfolioConfig = (config = {}) => ({
  theme: normalizeTheme(config.theme),
  includedSections: normalizeSections(config.includedSections),
  includedItems: normalizeItems(config.includedItems),
});

const buildConfigFromPortfolio = (portfolio) =>
  normalizePortfolioConfig({
    theme: portfolio?.theme || DEFAULT_THEME,
    includedSections: portfolio?.includedSections,
    includedItems: portfolio?.includedItems,
  });

module.exports = {
  DEFAULT_SECTIONS,
  DEFAULT_THEME,
  ITEM_KEYS,
  buildConfigFromPortfolio,
  normalizePortfolioConfig,
};
