'use strict';

const jwt = require('jsonwebtoken');

const githubService = require('../services/githubService');
const prisma = require('../config/prisma');
const { success, error } = require('../utils/apiResponse');

const getClientBaseUrl = () => (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');

const redirectToGithubPage = (res, status) =>
  res.redirect(`${getClientBaseUrl()}/student/github?status=${encodeURIComponent(status)}`);

const buildGithubState = (userId) =>
  jwt.sign(
    {
      userId,
      purpose: 'github-oauth',
    },
    process.env.GITHUB_STATE_SECRET || process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '10m' }
  );

const readGithubState = (state) => {
  const decoded = jwt.verify(
    state,
    process.env.GITHUB_STATE_SECRET || process.env.ACCESS_TOKEN_SECRET
  );

  if (decoded.purpose !== 'github-oauth' || !decoded.userId) {
    throw new Error('INVALID_GITHUB_STATE');
  }

  return decoded.userId;
};

const auth = (req, res) => {
  if (!process.env.GITHUB_CLIENT_ID) {
    return error(res, 500, 'Configuration GitHub manquante.');
  }

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    scope: process.env.GITHUB_SCOPE || 'read:user,repo',
    state: buildGithubState(req.user.userId),
  });

  if (process.env.GITHUB_CALLBACK_URL) {
    params.set('redirect_uri', process.env.GITHUB_CALLBACK_URL);
  }

  return success(res, 200, 'URL de redirection GitHub generee.', {
    url: `https://github.com/login/oauth/authorize?${params.toString()}`,
  });
};

const callback = async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    return redirectToGithubPage(res, 'error');
  }

  try {
    const userId = readGithubState(state);
    const token = await githubService.getAccessToken(code);

    if (!token) {
      return redirectToGithubPage(res, 'error');
    }

    await githubService.saveGithubToken(userId, token);
    return redirectToGithubPage(res, 'success');
  } catch (_err) {
    return redirectToGithubPage(res, 'error');
  }
};

const getStats = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.userId } });

    if (!student || !student.githubAccessToken) {
      return success(res, 200, 'Non connecte a GitHub', { connected: false });
    }

    const stats = await githubService.fetchStudentStats(student.githubAccessToken, student.id);
    return success(res, 200, 'Statistiques recuperees avec succes', {
      connected: true,
      ...stats,
    });
  } catch (err) {
    return error(res, 502, 'Impossible de recuperer les donnees GitHub.', {
      details: process.env.NODE_ENV === 'production' ? undefined : err.message,
    });
  }
};

const importProject = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.userId } });
    if (!student) return error(res, 404, 'Etudiant non trouve.');

    const { repoName, repoDescription, repoUrl } = req.body;

    if (!repoName || !repoUrl || !/^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/.test(repoUrl)) {
      return error(res, 400, 'Depot GitHub invalide.');
    }

    const existingProject = await prisma.project.findFirst({
      where: { studentId: student.id, githubUrl: repoUrl },
    });

    if (existingProject) {
      return error(res, 409, 'Ce projet existe deja dans votre portfolio.');
    }

    const newProject = await prisma.project.create({
      data: {
        title: repoName,
        description: repoDescription || 'Projet importe depuis GitHub',
        githubUrl: repoUrl,
        type: 'PERSONAL',
        visibility: 'PRIVATE',
        validationStatus: 'DRAFT',
        studentId: student.id,
      },
    });

    return success(res, 201, 'Projet ajoute avec succes.', { project: newProject });
  } catch (err) {
    return error(res, 500, 'Erreur lors de limport du projet.', {
      details: process.env.NODE_ENV === 'production' ? undefined : err.message,
    });
  }
};

module.exports = { auth, callback, getStats, importProject };
