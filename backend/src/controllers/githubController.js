'use strict';

const githubService = require('../services/githubService');
const prisma = require('../config/prisma');
const studentProjectService = require('../services/studentProjectService');
const { success, error } = require('../utils/apiResponse');

const getClientUrl = () => process.env.CLIENT_URL || 'http://localhost:5173';

const getCallbackUrl = () =>
  process.env.GITHUB_CALLBACK_URL || process.env.GITHUB_REDIRECT_URI || null;

const buildFrontendRedirect = (status) =>
  `${getClientUrl()}/student/github?status=${status}`;

const auth = (req, res) => {
  try {
    if (!process.env.GITHUB_CLIENT_ID) {
      return error(res, 500, 'Configuration GitHub incomplète.');
    }

    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID,
      scope: 'repo,read:user',
      state: req.user.userId,
    });
    const callbackUrl = getCallbackUrl();

    if (callbackUrl) {
      params.set('redirect_uri', callbackUrl);
    }

    return success(res, 200, 'URL de redirection générée.', {
      url: `https://github.com/login/oauth/authorize?${params.toString()}`,
    });
  } catch (err) {
    return error(res, 500, err.message);
  }
};

const callback = async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.redirect(buildFrontendRedirect('error'));
  }

  try {
    const token = await githubService.getAccessToken(code, getCallbackUrl());

    if (!token) {
      return res.redirect(buildFrontendRedirect('error'));
    }

    await githubService.saveGithubToken(state, token);
    return res.redirect(buildFrontendRedirect('success'));
  } catch (err) {
    return res.redirect(buildFrontendRedirect('error'));
  }
};

const getStats = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user.userId },
      select: {
        id: true,
        githubAccessToken: true,
      },
    });

    if (!student || !student.githubAccessToken) {
      return success(res, 200, 'Compte GitHub non connecté.', { connected: false });
    }

    const stats = await githubService.fetchStudentStats(
      student.githubAccessToken,
      student.id,
    );

    return success(res, 200, 'Statistiques GitHub récupérées.', {
      connected: true,
      ...stats,
    });
  } catch (err) {
    return error(res, 500, err.message);
  }
};

const importProject = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user.userId },
      select: { id: true },
    });

    if (!student) {
      return error(res, 404, 'Profil étudiant introuvable.');
    }

    const repoName = String(req.body.repoName || '').trim();
    const repoDescription = String(req.body.repoDescription || '').trim();
    const repoUrl = String(req.body.repoUrl || '').trim();
    const repoLanguage = String(req.body.repoLanguage || '').trim();

    if (!repoName || !repoUrl) {
      return error(res, 400, 'Nom et URL du dépôt obligatoires.');
    }

    const existingProject = await prisma.project.findFirst({
      where: {
        studentId: student.id,
        githubUrl: repoUrl,
      },
      select: { id: true },
    });

    if (existingProject) {
      return error(res, 409, 'Ce projet existe déjà dans votre portfolio.');
    }

    const project = await studentProjectService.createProject(req.user.userId, {
      title: repoName,
      description: repoDescription || 'Projet importé depuis GitHub.',
      githubUrl: repoUrl,
      type: 'PERSONAL',
      visibility: 'PRIVATE',
      technologies: repoLanguage ? [repoLanguage] : [],
    });

    return success(res, 201, 'Projet ajouté depuis GitHub.', { project });
  } catch (err) {
    if (err.message === 'INVALID_PROJECT_TYPE') {
      return error(res, 400, 'Type de projet invalide.');
    }

    return error(res, 500, err.message);
  }
};

module.exports = {
  auth,
  callback,
  getStats,
  importProject,
};
