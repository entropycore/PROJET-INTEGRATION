export const sidebarConfig = {
  ADMINISTRATOR: [
    {
      section: 'TABLEAU DE BORD',
      items: [
        { label: 'Vue globale', path: '/admin', icon: 'dashboard.svg' },
      ],
    },
    {
      section: 'Gestion Utilisateurs',
      items: [
        {
        label: 'Gestion des utilisateurs',
        icon: 'users.svg',
        children: [
          { label: 'Étudiants', path: '/admin/users?role=STUDENT', icon: 'student.svg' },
          { label: 'Professeurs', path: '/admin/users?role=PROFESSOR', icon: 'profile.svg'},
          { label: 'Recruiters', path: '/admin/users?role=PROFESSIONAL', icon: 'recruters.svg'},
        ],
         },
        { label: 'Validation en attente', path: '/admin/validations', icon: 'validation.svg' },
        { label: 'Signalements', path: '/admin/reports', icon: 'reports.svg' },
      ],
     },
      {
      section: 'RÉPERTOIRE',
      items: [
        { label: 'Explore Profiles', path: '/admin/profiles', icon: 'profiles.svg' },
      ],
    },
    {
      section: 'SYSTÈME',
      items: [
        { label: 'Système de badges', path: '/admin/Badges', icon: 'badge.svg' },
        { label: 'Notifications', path: '/admin/notifications', icon: 'notification.svg', danger: true },
        { label: 'Paramètres ', path: '/admin/settings', icon: 'settings.svg' },
      ],
    },
  ],

  STUDENT: [
  {
    section: 'TABLEAU DE BORD',
    items: [
      { label: "Vue d'ensemble", path: '/student', icon: 'dashboard.svg' },
      { label: 'Mon profil', path: '/student/profile', icon: 'profile.svg' },
    ],
  },

  {
    section: 'ACADÉMIQUE',
    items: [
      { label: 'Mes projets', path: '/student/projects', icon: 'projects.svg' },
      { label: 'Stages', path: '/student/stages', icon: 'internship.svg' },
      { label: 'Activités parascolaires', path: '/student/activities', icon: 'activity.svg' },
      { label: 'Compétences', path: '/student/competances', icon: 'skills.svg' },
    ],
  },

  {
    section: 'PORTFOLIO',
    items: [
      { label: 'Portfolio public', path: '/student/portfolio', icon: 'portfolio.svg' },
      { label: 'Mon GitHub', path: '/student/github', icon: 'github.svg' },
    ],
  },

  {
    section: 'INTERACTIONS',
    items: [
      { label: 'Recommandations', path: '/student/recommendations', icon: 'recommendation.svg' },
      { label: 'Lettres de reco.', path: '/student/recommendation-letters', icon: 'letter.svg' },
      { label: 'Commentaires', path: '/student/comments', icon: 'comments.svg' },
    ],
  },

  {
    section: 'SYSTÈME',
    items: [
      { label: 'Notifications', path: '/student/notifications', icon: 'notification.svg' },
      { label: 'Paramètres', path: '/student/settings', icon: 'settings.svg' },
    ],
  },
],

  PROFESSOR: [
    {
      section: 'TABLEAU DE BORD',
      items: [
        { label: 'Vue globale', path: '/professor', icon: 'dashboard.svg' },
        { label: 'Validations', path: '/professor/validations', icon: 'validation.svg' },
      ],
    },
  ],

  PROFESSIONAL: [
    {
      section: 'TABLEAU DE BORD',
      items: [
        { label: 'Vue globale', path: '/professional', icon: 'dashboard.svg' },
        { label: 'Explore Profiles', path: '/profiles', icon: 'profiles.svg' },
      ],
    },
  ],
}