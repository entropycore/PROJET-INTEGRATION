export const studentPortfolioMock = {
  portfolio: {
    id: "portfolio-1",
    title: "Portfolio académique certifié",
    slug: "douae-essabi",
    status: "ACTIVE",
    published: true,
    visibility: "PUBLIC",
    publicUrl: "/portfolio/douae-essabi",
    theme: "modern-academic",
  },

  student: {
    firstName: "Douae",
    lastName: "Essabi",
    fullName: "Douae Essabi",
    role: "Étudiante Ingénieur",
    major: "Génie Informatique",
    school: "ENSA Tanger",
    city: "Tanger, Maroc",

    email: "douae.essabi@ensa.ac.ma",
    phone: "+212 6 00 00 00 00",

    linkedinUrl: "https://linkedin.com/in/douaeessabi",
    githubUrl: "https://github.com/douaeessabi",

    profilePicture: "/portfolio/profile.jpg",


    bio:
      "Étudiante en 1ère année de Génie Informatique, je développe des solutions full-stack avec Laravel, React et Node.js. Rigoureux et curieux, j’accorde une importance particulière à la qualité du code, aux bonnes pratiques et à l’expérience utilisateur",
  },

  credibilityScore: {
    score: 82,
    level: "ADVANCED",
    label: "Niveau avancé",
  },

  badges: [
    {
      id: 1,
      name: "Web Developer",
      icon: "language",
      tone: "blue",
    },
    {
      id: 2,
      name: "DevOps Explorer",
      icon: "cloud",
      tone: "cyan",
    },
    {
      id: 3,
      name: "Hackathon Participant",
      icon: "groups",
      tone: "purple",
    },
    {
      id: 4,
      name: "Full Stack",
      icon: "layers",
      tone: "green",
    },
  ],

  skills: [
    "Vue.js",
    "JavaScript",
    "Node.js",
    "PostgreSQL",
    "Docker",
    "GitHub",
  ],

  softSkills: [
    "Travail en équipe",
    "Communication",
    "Organisation",
    "Résolution de problèmes",
  ],

  projects: [
    {
      id: 1,

      title: "Plateforme Credencia",

      type: "Projet d’intégration",

      validator: "Pr. Moussaoui",

      description:
        "Plateforme académique permettant de générer automatiquement des portfolios certifiés à partir des projets, stages, badges et recommandations validés.",

      roleInTeam: "Frontend Developer",

      team: "Équipe de 6 étudiants",

      technologies: [
        "Vue.js",
        "Vite",
        "Pinia",
        "CSS",
      ],

      githubUrl:
        "https://github.com/example/credencia",

      demoUrl:
        "https://credencia-demo.example.com",

      documentationUrl:
        "/files/credencia-documentation.pdf",

      screenshots: [
        "/portfolio/project-1.jpg",

        "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
      ],

      attachments: [
        {
          name: "Rapport technique",
          type: "PDF",
          url: "/files/rapport-credencia.pdf",
        },
      ],
    },

    {
      id: 2,

      title: "Gestion de présence QR Code",

      type: "Projet module",

      validator: "Pr. Benali",

      description:
        "Application web permettant aux enseignants de générer des sessions de présence avec QR Code et aux étudiants d’enregistrer automatiquement leur présence.",

      roleInTeam: "Frontend Developer",

      team: "Équipe de 4 étudiants",

      technologies: [
        "Vue.js",
        "Express",
        "PostgreSQL",
      ],

      githubUrl:
        "https://github.com/example/qr-attendance",

      demoUrl: "",

      documentationUrl: "",

      screenshots: [
        "/portfolio/project-2.jpg",
      ],

      attachments: [],
    },
  ],

  internships: [
    {
      id: 1,

      title: "Stage développement web",

      company: "Capgemini Maroc",

      department: "Département Digital & Cloud",

      startDate: "2026-06-01",

      endDate: "2026-07-31",

      duration: "2 mois",

      period: "Juin 2026 - Juillet 2026",

      supervisor: "Pr. El Amrani",

      description:
        "Stage axé sur le développement d’interfaces web responsives et l’intégration avec des APIs backend dans un environnement professionnel.",

      missions: [
        "Développement d’interfaces Vue.js responsives",

        "Intégration des APIs REST",

        "Participation aux tests fonctionnels",

        "Amélioration de l’expérience utilisateur",
      ],

      technologies: [
        "Vue.js",
        "Node.js",
        "PostgreSQL",
      ],

      screenshots: [
       "/portfolio/stage-1.jpg",
      ],

      reportUrl:
        "/files/rapport-stage.pdf",
    },
  ],

  activities: [
    {
      id: 1,

      title: "Hackathon Maroc AI",

      type: "Hackathon",

      organization: "ENSA Tanger",

      date: "Avril 2026",

      duration: "24 heures",

      location: "Tanger, Maroc",

      description:
        "Participation à un hackathon autour de l’intelligence artificielle avec conception d’une solution innovante en équipe.",

      screenshots: [
        "/portfolio/activity-1.jpg",
    ],

      certificateUrl:
        "/files/certificat-hackathon.pdf",

      certificateType: "PDF",

      validator: "Administration ENSA Tanger",
    },

    {
      id: 2,

      title: "Membre du Club Informatique",

      type: "Club",

      organization:
        "Club Informatique ENSA Tanger",

      date: "2025 - 2026",

      duration: "1 année universitaire",

      location: "ENSA Tanger",

      description:
        "Participation à l’organisation d’ateliers techniques, de formations en développement web et d’événements étudiants.",

      screenshots: [
        "/portfolio/activity-2.jpg",
      ],

      certificateUrl:
        "/files/attestation-club.png",

      certificateType: "PNG",

      validator: "Responsable du club",
    },
  ],

  recommendationLetters: [
    {
      id: 1,

      title: "Lettre de recommandation",

      author: "Pr. Moussaoui",

      objective: "Master",

      downloadable: true,

      downloadUrl: "/files/letter.pdf",

      validator: "Administration ENSA Tanger",
    },
  ],

  recommendations: [
    {
      id: 1,

      author: "Yasmine El Amrani",

      role: "Professeure",

      organization: "ENSA Tanger",

      initials: "YE",

      content:
        "Profil sérieux, motivé et capable de travailler efficacement sur des projets techniques.",
    },

    {
      id: 2,

      author: "Laila Hajji",

      role: "Tech Lead",

      organization: "Intelia Group",

      initials: "LH",

      content:
        "Durant son stage, Douae s’est rapidement adaptée à notre stack technique et a livré un travail de qualité.",
    },
  ],
};