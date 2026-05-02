export const sidebarConfig = {
  ADMINISTRATOR: [
    {
      section: 'TABLEAU DE BORD',
      items: [
        { label: 'Vue globale', path: '/admin', icon: 'dashboard.svg' },
        { label: 'Gestion des utilisateurs', path: '/admin/users', icon: 'users.svg'},
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
        { label: 'Notifications', path: '/admin/notifications', icon: 'notification.svg', danger: true },
      ],
    },
  ],

  STUDENT: [
    {
      section: 'TABLEAU DE BORD',
      items: [
        { label: 'Vue globale', path: '/student', icon: 'dashboard.svg' },
        { label: 'Mon portfolio', path: '/student/portfolio', icon: 'portfolio.svg' },
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