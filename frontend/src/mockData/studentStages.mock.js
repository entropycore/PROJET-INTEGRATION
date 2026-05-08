// BACKEND PLUS TARD :
// Remplacer ces données mockées par les appels API réels.
// Le contrat actuel contient /api/v1/internships/me,
// mais côté frontend on travaille temporairement avec la logique /api/student/stages.

export const studentStages = [
  {
    id: '1',
    title: 'Développement Frontend Vue.js',
    company: 'Capgemini Maroc',
    duration: '2 mois',
    startDate: '2026-06-01',
    endDate: '2026-07-31',
    supervisor: {
      fullName: 'Pr. Karim Alaoui',
      department: 'Génie Informatique',
    },
    technologies: ['Vue.js', 'Vite', 'Node.js', 'PostgreSQL'],
    validationStatus: 'APPROVED',
    visibility: 'PUBLIC',
    description:
      'Développement d’interfaces modernes et intégration de composants réutilisables pour une plateforme interne.',
    missions: [
      'Création de composants Vue réutilisables',
      'Refonte UI du dashboard',
      'Connexion progressive aux APIs backend',
    ],
    reportUrl: '/mock/reports/stage-capgemini.pdf',
    images: [],
    validationHistory: [],
    createdAt: '2026-06-01',
    updatedAt: '2026-07-28',
  },

  {
    id: '2',
    title: 'Développement Backend Node.js',
    company: 'Orange Digital Center',
    duration: '3 mois',
    startDate: '2026-02-01',
    endDate: '2026-04-30',
    supervisor: {
      fullName: 'Mme Sara El Idrissi',
      department: 'Département Informatique',
    },
    technologies: ['Node.js', 'Express', 'MongoDB', 'JWT'],
    validationStatus: 'PENDING',
    visibility: 'PRIVATE',
    description:
      'Participation au développement des APIs REST et gestion sécurisée de l’authentification.',
    missions: [
      'Création d’APIs REST',
      'Gestion de l’authentification JWT',
      'Tests backend',
    ],
    reportUrl: '/mock/reports/stage-orange.pdf',
    images: [],
    validationHistory: [],
    createdAt: '2026-02-01',
    updatedAt: '2026-05-02',
  },

  {
    id: '3',
    title: 'Application Mobile Flutter',
    company: 'Freelance',
    duration: '1 mois',
    startDate: '2026-05-01',
    endDate: '2026-05-31',
    supervisor: {
      fullName: 'À définir',
      department: 'Non défini',
    },
    technologies: ['Flutter', 'Dart', 'Firebase'],
    validationStatus: 'DRAFT',
    visibility: 'PRIVATE',
    description:
      'Développement d’une application mobile de gestion des tâches pour les étudiants.',
    missions: [
      'Création des interfaces mobiles',
      'Gestion des tâches',
      'Connexion avec Firebase',
    ],
    reportUrl: '',
    images: [],
    validationHistory: [],
    createdAt: '2026-05-01',
    updatedAt: '2026-05-10',
  },
  {
    id: '4',
    title: 'Application Mobile Flutter',
    company: 'Freelance',
    duration: '1 mois',
    startDate: '2026-05-01',
    endDate: '2026-05-31',
    supervisor: {
      fullName: 'À définir',
      department: 'Non défini',
    },
    technologies: ['Flutter', 'Dart', 'Firebase'],
    validationStatus: 'DRAFT',
    visibility: 'PRIVATE',
    description:
      'Développement d’une application mobile de gestion des tâches pour les étudiants.',
    missions: [
      'Création des interfaces mobiles',
      'Gestion des tâches',
      'Connexion avec Firebase',
    ],
    reportUrl: '',
    images: [],
    validationHistory: [],
    createdAt: '2026-05-01',
    updatedAt: '2026-05-10',
  },
]