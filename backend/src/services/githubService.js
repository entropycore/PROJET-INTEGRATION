'use strict';

const axios = require('axios');
const crypto = require('crypto');

const prisma = require('../config/prisma');
const logger = require('../logs/logger');

const ENCRYPTED_PREFIX = 'enc:v1:';

const getEncryptionKey = () => {
  if (!process.env.GITHUB_TOKEN_ENCRYPTION_KEY) return null;
  return crypto
    .createHash('sha256')
    .update(process.env.GITHUB_TOKEN_ENCRYPTION_KEY)
    .digest();
};

const encryptToken = (token) => {
  const key = getEncryptionKey();
  if (!key) return token;

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${ENCRYPTED_PREFIX}${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
};

const decryptToken = (token) => {
  if (!token?.startsWith(ENCRYPTED_PREFIX)) return token;

  const key = getEncryptionKey();
  if (!key) {
    throw new Error('GITHUB_TOKEN_ENCRYPTION_KEY_REQUIRED');
  }

  const [ivBase64, tagBase64, encryptedBase64] = token.slice(ENCRYPTED_PREFIX.length).split(':');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivBase64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagBase64, 'base64'));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedBase64, 'base64')),
    decipher.final(),
  ]).toString('utf8');
};

const getAccessToken = async (code) => {
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    throw new Error('GITHUB_OAUTH_NOT_CONFIGURED');
  }

  const response = await axios.post(
    'https://github.com/login/oauth/access_token',
    {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    },
    {
      headers: { accept: 'application/json' },
      timeout: 10000,
    }
  );

  if (response.data.error) {
    throw new Error(response.data.error_description || response.data.error);
  }

  return response.data.access_token;
};

const saveGithubToken = async (userId, token) =>
  prisma.student.update({
    where: { userId },
    data: { githubAccessToken: encryptToken(token) },
  });

const fetchStudentStats = async (storedAccessToken, studentId) => {
  const accessToken = decryptToken(storedAccessToken);
  const config = {
    headers: { Authorization: `Bearer ${accessToken}` },
    timeout: 10000,
  };

  const profile = await axios.get('https://api.github.com/user', config);
  const repos = await axios.get('https://api.github.com/user/repos?sort=updated&per_page=100', config);

  let totalContributions = 0;
  try {
    const graphqlQuery = {
      query: `
        query {
          viewer {
            contributionsCollection {
              contributionCalendar {
                totalContributions
              }
            }
          }
        }
      `,
    };
    const graphqlResponse = await axios.post('https://api.github.com/graphql', graphqlQuery, config);
    totalContributions =
      graphqlResponse.data.data.viewer.contributionsCollection.contributionCalendar.totalContributions;
  } catch (err) {
    logger.warn({
      message: 'GitHub GraphQL contributions unavailable',
      error: err.message,
    });
  }

  const existingProjects = await prisma.project.findMany({
    where: { studentId },
    select: { githubUrl: true },
  });
  const importedUrls = existingProjects.map((project) => project.githubUrl);

  const languages = [...new Set(repos.data.map((repo) => repo.language).filter(Boolean))];

  const repositories = repos.data.map((repo) => ({
    id: repo.id,
    name: repo.name,
    description: repo.description,
    url: repo.html_url,
    language: repo.language,
    updatedAt: repo.updated_at,
    isImported: importedUrls.includes(repo.html_url),
  }));

  return {
    username: profile.data.login,
    profileUrl: profile.data.html_url,
    publicRepos: profile.data.public_repos,
    languages,
    totalContributions,
    repositories,
  };
};

module.exports = {
  getAccessToken,
  saveGithubToken,
  fetchStudentStats,
};
