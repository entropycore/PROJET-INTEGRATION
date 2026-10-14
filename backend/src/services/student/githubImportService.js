'use strict';

const axios = require('axios');
const prisma = require('../../config/prisma');
const studentProjectService = require('../studentProjectService');

const getGithubCallbackUrl = () =>
  process.env.GITHUB_CALLBACK_URL || process.env.GITHUB_REDIRECT_URI;

const getStudentOrThrow = async (userId) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: {
      id: true,
      githubAccessToken: true,
    },
  });

  if (!student) {
    throw new Error('STUDENT_PROFILE_NOT_FOUND');
  }

  return student;
};

const getGithubAccessToken = async (code) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const redirectUri = getGithubCallbackUrl();

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('GITHUB_NOT_CONFIGURED');
  }

  const response = await axios.post(
    'https://github.com/login/oauth/access_token',
    {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    },
    {
      headers: { accept: 'application/json' },
    },
  );

  if (!response.data?.access_token) {
    throw new Error('GITHUB_TOKEN_EXCHANGE_FAILED');
  }

  return response.data.access_token;
};

const getStudentGithubAuthLink = async (userId) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = getGithubCallbackUrl();

  if (!clientId || !redirectUri) {
    throw new Error('GITHUB_NOT_CONFIGURED');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'read:user repo',
    state: userId,
  });

  return {
    url: `https://github.com/login/oauth/authorize?${params.toString()}`,
  };
};

const handleGithubCallback = async ({ code, state }) => {
  if (!code || !state) {
    throw new Error('GITHUB_CALLBACK_INVALID');
  }

  const token = await getGithubAccessToken(code);

  await prisma.student.update({
    where: { userId: state },
    data: { githubAccessToken: token },
  });
};

const getTotalContributions = async (accessToken) => {
  try {
    const response = await axios.post(
      'https://api.github.com/graphql',
      {
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
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    return (
      response.data?.data?.viewer?.contributionsCollection?.contributionCalendar
        ?.totalContributions || 0
    );
  } catch {
    return 0;
  }
};

const getStudentGithubStats = async (userId) => {
  const student = await getStudentOrThrow(userId);

  if (!student.githubAccessToken) {
    return {
      connected: false,
      username: '',
      profileUrl: '',
      repositories: [],
      languages: [],
      publicRepos: 0,
      totalContributions: 0,
    };
  }

  const config = {
    headers: { Authorization: `Bearer ${student.githubAccessToken}` },
  };

  const [profileResponse, reposResponse, existingProjects, totalContributions] =
    await Promise.all([
      axios.get('https://api.github.com/user', config),
      axios.get('https://api.github.com/user/repos?sort=updated&per_page=100', config),
      prisma.project.findMany({
        where: { studentId: student.id },
        select: { githubUrl: true },
      }),
      getTotalContributions(student.githubAccessToken),
    ]);

  const importedUrls = existingProjects.map((project) => project.githubUrl).filter(Boolean);
  const repositories = reposResponse.data.map((repo) => ({
    id: repo.id,
    name: repo.name,
    description: repo.description,
    url: repo.html_url,
    language: repo.language,
    updatedAt: repo.updated_at,
    isImported: importedUrls.includes(repo.html_url),
  }));

  return {
    connected: true,
    username: profileResponse.data.login,
    profileUrl: profileResponse.data.html_url,
    publicRepos: profileResponse.data.public_repos,
    languages: [...new Set(repositories.map((repo) => repo.language).filter(Boolean))],
    totalContributions,
    repositories,
  };
};

const importGithubRepository = async (userId, payload) => {
  const student = await getStudentOrThrow(userId);
  const repoName = String(payload.repoName || '').trim();
  const repoUrl = String(payload.repoUrl || '').trim();

  if (!repoName) {
    throw new Error('GITHUB_REPOSITORY_NAME_REQUIRED');
  }

  if (repoUrl) {
    const existingProject = await prisma.project.findFirst({
      where: {
        studentId: student.id,
        githubUrl: repoUrl,
      },
      select: { id: true },
    });

    if (existingProject) {
      throw new Error('GITHUB_REPOSITORY_ALREADY_IMPORTED');
    }
  }

  return studentProjectService.createProject(userId, {
    title: repoName,
    description: payload.repoDescription || 'Projet importe depuis GitHub.',
    type: 'Personnel',
    role: 'Repository owner',
    technologies: payload.repoLanguage ? [payload.repoLanguage] : [],
    githubUrl: repoUrl || null,
    extraLinks: repoUrl
      ? [
          {
            label: 'GitHub Repository',
            url: repoUrl,
          },
        ]
      : [],
  });
};

module.exports = {
  getStudentGithubAuthLink,
  handleGithubCallback,
  getStudentGithubStats,
  importGithubRepository,
};
