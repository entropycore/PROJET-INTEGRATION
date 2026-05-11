const githubService = require('../services/githubService');
const prisma = require('../config/prisma');
const { success, error } = require('../utils/apiResponse'); 

// Génère l'URL d'autorisation OAuth GitHub
const auth = (req, res) => {
    try {
        const userId = req.user.userId; 
        const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo,read:user&state=${userId}`;
        
        return success(res, 200, "URL de redirection générée avec succès", { url: redirectUrl });
    } catch (err) {
        return error(res, 500, err.message);
    }
};

// Gère le retour de GitHub et sauvegarde le token d'accès
const callback = async (req, res) => {
    const { code, state } = req.query;
    const userId = state;

    if (!code || !userId) return res.redirect('http://localhost:5173/student/github?status=error');

    try {
        const token = await githubService.getAccessToken(code);
        if (token) {
            await githubService.saveGithubToken(userId, token);
            return res.redirect('http://localhost:5173/student/github?status=success');
        }
        return res.redirect('http://localhost:5173/student/github?status=error');
    } catch (err) {
        return res.redirect('http://localhost:5173/student/github?status=error');
    }
};

// Retourne les statistiques GitHub de l'étudiant
const getStats = async (req, res) => {
    try {
        const student = await prisma.student.findUnique({ where: { userId: req.user.userId } });

        if (!student || !student.githubAccessToken) {
            return success(res, 200, "Non connecté à GitHub", { connected: false });
        }

        const stats = await githubService.fetchStudentStats(student.githubAccessToken, student.id);
        return success(res, 200, "Statistiques récupérées avec succès", { connected: true, ...stats });
    } catch (err) {
        return error(res, 500, err.message);
    }
};

// Importe un dépôt GitHub comme projet personnel
const importProject = async (req, res) => {
    try {
        const student = await prisma.student.findUnique({ where: { userId: req.user.userId } });
        if (!student) return error(res, 404, "Étudiant non trouvé");

        const { repoName, repoDescription, repoUrl, repoLanguage } = req.body;

        const existingProject = await prisma.project.findFirst({
            where: { studentId: student.id, githubUrl: repoUrl }
        });

        if (existingProject) {
            return error(res, 400, "Ce projet est déjà dans votre portfolio");
        }

        const newProject = await prisma.project.create({
            data: {
                title: repoName,
                description: repoDescription || "Projet importé depuis GitHub",
                githubUrl: repoUrl,
                type: "PERSONAL", 
                visibility: "PRIVATE", 
                studentId: student.id
            }
        });

        return success(res, 201, "Projet ajouté avec succès", { project: newProject });
    } catch (err) {
        return error(res, 500, err.message);
    }
};

module.exports = { auth, callback, getStats, importProject };