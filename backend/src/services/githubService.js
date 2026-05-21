const axios = require('axios');
const prisma = require('../config/prisma');

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

const getAccessToken = async (code) => {
    const response = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code
    }, {
        headers: { accept: 'application/json' }
    });
    return response.data.access_token;
};

const saveGithubToken = async (userId, token) => {
    return await prisma.student.update({
        where: { userId: userId }, 
        data: { githubAccessToken: token }
    });
};

const fetchStudentStats = async (accessToken, studentId) => {
    const config = { headers: { Authorization: `Bearer ${accessToken}` } };
    
    const profile = await axios.get('https://api.github.com/user', config);
    const repos = await axios.get('https://api.github.com/user/repos?sort=updated&per_page=100', config);
    
    // Récupération des contributions via l'API GraphQL (contournement des limites REST)
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
            `
        };
        const graphqlResponse = await axios.post('https://api.github.com/graphql', graphqlQuery, config);
        totalContributions = graphqlResponse.data.data.viewer.contributionsCollection.contributionCalendar.totalContributions;
    } catch (err) {
        console.error("Erreur GraphQL:", err.message);
    }

    // Identification des dépôts déjà importés dans le portfolio
    const existingProjects = await prisma.project.findMany({
        where: { studentId: studentId },
        select: { githubUrl: true }
    });
    const importedUrls = existingProjects.map(p => p.githubUrl);

    const languages = [...new Set(repos.data.map(repo => repo.language).filter(Boolean))];

    const repositories = repos.data.map(repo => ({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        language: repo.language,
        updatedAt: repo.updated_at,
        isImported: importedUrls.includes(repo.html_url) 
    }));

    return {
        username: profile.data.login,
        profileUrl: profile.data.html_url,
        publicRepos: profile.data.public_repos,
        languages: languages,
        totalContributions: totalContributions,
        repositories: repositories
    };
};

module.exports = {
    getAccessToken,
    saveGithubToken,
    fetchStudentStats
};