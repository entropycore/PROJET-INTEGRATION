export const mockProjects = [
    {
      id: 1,
      title: 'Plateforme E-Learning',
      description:
        'Système complet de gestion de cours en ligne avec suivi de progression, gestion des utilisateurs et validation académique.',
  
      type: 'Intégration',
  
      validationStatus: 'APPROVED',
  
      technologies: [
        'Vue 3',
        'Express',
        'PostgreSQL',
        'Docker',
      ],
  
      createdAt: '2026-03-12',
  
      validatorName: 'Pr. Moussaoui',
  
      validationComment:
        'Excellent travail, architecture propre et documentation claire.',
        githubUrl: 'https://github.com/...',
demoUrl: 'https://...',
documentationUrl: 'https://...',
portfolioUrl: 'https://...',

coverImage: '/images/mock/project-cover.png',

attachments: [
  {
    id: 1,
    name: 'Rapport du projet.pdf',
    type: 'PDF',
    url: '#'
  },
  {
    id: 2,
    name: 'Certificat de participation.png',
    type: 'IMAGE',
    url: '#'
  }
],

validationHistory: [
  {
    id: 1,
    status: 'DRAFT',
    title: 'Projet créé',
    comment: 'Le projet a été enregistré comme brouillon.',
    actorName: 'Mohamed Zaaboul',
    actorRole: 'Étudiant',
    createdAt: '2026-03-12'
  },
  {
    id: 2,
    status: 'PENDING',
    title: 'Projet soumis',
    comment: 'Projet envoyé pour validation académique.',
    actorName: 'Mohamed Zaaboul',
    actorRole: 'Étudiant',
    createdAt: '2026-03-14'
  },
  {
    id: 3,
    status: 'APPROVED',
    title: 'Projet validé',
    comment: 'Excellent travail, architecture propre et documentation claire.',
    actorName: 'Pr. Moussaoui',
    actorRole: 'Validateur académique',
    createdAt: '2026-03-18'
  }
]
    },
  
    {
      id: 2,
  
      title: 'Pipeline CI/CD DevSecOps',
  
      description:
        'Pipeline automatisé avec tests unitaires, analyse de sécurité, build Docker et déploiement continu.',
  
      type: 'Module',
  
      validationStatus: 'PENDING',
  
      technologies: [
        'GitHub Actions',
        'Docker',
        'Trivy',
        'Node.js',
      ],
  
      createdAt: '2026-04-08',
  
      validatorName: null,
  
      validationComment: null,
    },
  
    {
      id: 3,
  
      title: 'Dashboard Analytics',
  
      description:
        'Tableau de bord interactif de visualisation de données académiques avec graphiques dynamiques.',
  
      type: 'Personnel',
  
      validationStatus: 'DRAFT',
  
      technologies: [
        'Vue 3',
        'Chart.js',
        'Pinia',
      ],
  
      createdAt: '2026-05-01',
  
      validatorName: null,
  
      validationComment: null,
    },
  
    {
      id: 4,
  
      title: 'Hackathon Green Campus',
  
      description:
        'Prototype d\'une plateforme de suivi énergétique intelligente pour les établissements universitaires.',
  
      type: 'Hackathon',
  
      validationStatus: 'CHANGES_REQUESTED',
  
      technologies: [
        'Vue 3',
        'Firebase',
        'Chart.js',
      ],
  
      createdAt: '2026-02-19',
  
      validatorName: 'Pr. Benali',
  
      validationComment:
        'Ajouter plus de détails sur la collecte des données et les résultats obtenus.',
    },
  
    {
      id: 5,
  
      title: 'API REST Sécurisée',
  
      description:
        'Backend REST avec authentification JWT, rôles utilisateurs, middleware de sécurité et documentation Swagger.',
  
      type: 'Module',
  
      validationStatus: 'REJECTED',
  
      technologies: [
        'Express',
        'JWT',
        'Swagger',
        'Jest',
      ],
  
      createdAt: '2026-01-27',
  
      validatorName: 'Mme Ghizlan',
  
      validationComment:
        'Le projet manque encore de tests de sécurité et de validation complète.',
    },
  
    {
      id: 6,
  
      title: 'Stage Fullstack Web',
  
      description:
        'Développement d\'une application interne de gestion documentaire durant un stage en entreprise.',
  
      type: 'Stage',
  
      validationStatus: 'APPROVED',
  
      technologies: [
        'React',
        'Node.js',
        'MongoDB',
      ],
  
      createdAt: '2025-12-11',
  
      validatorName: 'Pr. Haddad',
  
      validationComment:
        'Stage validé avec un bon niveau technique et une intégration professionnelle réussie.',
    },
  ]