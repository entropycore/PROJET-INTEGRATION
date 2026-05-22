'use strict';

const studentProjectService = require('../studentProjectService');

const getStudentGithubAuthLink = async () => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error('GITHUB_NOT_CONFIGURED');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'read:user repo',
  });

  return {
    url: `https://github.com/login/oauth/authorize?${params.toString()}`,
  };
};

const getStudentGithubStats = async () => ({
  connected: false,
  username: '',
  profileUrl: '',
  repositories: [],
  languages: [],
  publicRepos: 0,
  totalContributions: 0,
});

const importGithubRepository = async (userId, payload) => {
  const repoName = String(payload.repoName || '').trim();

  if (!repoName) {
    throw new Error('GITHUB_REPOSITORY_NAME_REQUIRED');
  }

  return studentProjectService.createProject(userId, {
    title: repoName,
    description: payload.repoDescription || 'Projet importé depuis GitHub.',
    type: 'Personnel',
    role: 'Repository owner',
    technologies: payload.repoLanguage ? [payload.repoLanguage] : [],
    githubUrl: payload.repoUrl || null,
    extraLinks: payload.repoUrl
      ? [
          {
            label: 'GitHub Repository',
            url: payload.repoUrl,
          },
        ]
      : [],
  });
};

module.exports = {
  getStudentGithubAuthLink,
  getStudentGithubStats,
  importGithubRepository,
};
