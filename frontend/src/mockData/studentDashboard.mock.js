export const studentDashboardMock = {
  user: {
    firstName: "Mohamed",
    lastName: "Zaaboul",
  },

  stats: {
    validatedProjects: 3,
    credibilityScore: 82,
    badgesCount: 5,
    recommendationsCount: 12,
    pendingRecommendations: 3,
  },

  credibility: {
    score: 82,
    level: "ADVANCED",
    label: "Niveau Avancé",
    details: [
      { label: "Projets validés", value: 17 },
      { label: "Stages", value: 15 },
      { label: "GitHub", value: 12 },
      { label: "Recommandations", value: 10 },
      { label: "Profil complet", value: 9 },
    ],
  },

  recentProjects: [
    {
      id: 1,
      title: "Plateforme E-Learning",
      technologies: ["Vue.js", "Node.js", "PostgreSQL"],
      validationStatus: "APPROVED",
    },
    {
      id: 2,
      title: "Pipeline CI/CD",
      technologies: ["Docker", "GitHub Actions"],
      validationStatus: "APPROVED",
    },
    {
      id: 3,
      title: "API REST Sécurisée",
      technologies: ["Express.js", "JWT"],
      validationStatus: "PENDING",
    },
    {
      id: 4,
      title: "Dashboard Analytics",
      technologies: ["React", "D3.js"],
      validationStatus: "DRAFT",
    },
  ],

  badges: [
    {
      id: 1,
      name: "Web Developer",
      description: "Badge pour les étudiants actifs en développement web.",
      rule: "3 projets web validés",
      iconUrl: "",
      iconFallback: "🌐",
      tone: "blue",
      isObtained: true,
      obtainedAt: "Mars 2025",
    },

    {
      id: 2,
      name: "DevOps Explorer",
      description: "Badge lié aux outils DevOps.",
      rule: "Projet avec Docker + pipeline CI/CD",
      iconUrl: "",
      iconFallback: "☁️",
      tone: "cyan",
      isObtained: true,
      obtainedAt: "Avr 2025",
    },

    {
      id: 3,
      name: "Hackathon Participant",
      description: "Participation à des événements.",
      rule: "Participation à un hackathon validé",
      iconUrl: "",
      iconFallback: "👥",
      tone: "purple",
      isObtained: true,
      obtainedAt: "Fév 2025",
    },

    {
      id: 4,
      name: "Full Stack Developer",
      description: "Compétences frontend et backend.",
      rule: "Projet frontend + backend validés",
      iconUrl: "",
      iconFallback: "💠",
      tone: "green",
      isObtained: true,
      obtainedAt: "Jan 2025",
    },

    {
      id: 5,
      name: "Security Aware",
      description: "Bonnes pratiques sécurité.",
      rule: "Projet avec pratiques OWASP",
      iconUrl: "",
      iconFallback: "🛡️",
      tone: "red",
      isObtained: true,
      obtainedAt: "Déc 2024",
    },
  ],

  notifications: [
    {
      id: 1,
      title: "Projet validé",
      message: "Plateforme E-Learning validée par Pr. Moussaoui.",
      type: "SUCCESS",
      read: false,
      createdAt: "2026-05-08T10:00:00.000Z",
    },
    {
      id: 2,
      title: "Nouvelle recommandation",
      message: "Yasmine Benjelloun vous a recommandé.",
      type: "INFO",
      read: false,
      createdAt: "2026-05-07T14:30:00.000Z",
    },
    {
      id: 3,
      title: "Correction demandée",
      message: "API REST — Ajoutez la documentation Swagger.",
      type: "VALIDATION",
      read: true,
      createdAt: "2026-05-06T09:20:00.000Z",
    },
    {
      id: 4,
      title: "Badge obtenu",
      message: "Vous avez obtenu le badge Web Developer.",
      type: "BADGE",
      read: true,
      createdAt: "2026-05-05T16:10:00.000Z",
    },
  ],
};
