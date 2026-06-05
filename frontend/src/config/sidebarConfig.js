export const sidebarConfig = {
  ADMINISTRATOR: [
    {
      section: "TABLEAU DE BORD",
      items: [{ label: "Vue globale", path: "/admin", icon: "dashboard" }],
    },
    {
      section: "Gestion Utilisateurs",
      items: [
        {
          label: "Gestion des utilisateurs",
          icon: "groups",
          children: [
            {
              label: "Étudiants",
              path: "/admin/users?role=STUDENT",
              icon: "school",
            },
            {
              label: "Professeurs",
              path: "/admin/users?role=PROFESSOR",
              icon: "person",
            },
            {
              label: "Recruteurs",
              path: "/admin/users?role=PROFESSIONAL",
              icon: "business_center",
            },
          ],
        },
        {
          label: "Validation en attente",
          path: "/admin/validations",
          icon: "fact_check",
        },
        { label: "Signalements", path: "/admin/reports", icon: "report" },
      ],
    },
    {
      section: "RÉPERTOIRE",
      items: [
        {
          label: "Explore Profiles",
          path: "/admin/profiles",
          icon: "manage_search",
        },
      ],
    },
    {
      section: "SYSTÈME",
      items: [
        {
          label: "Système de badges",
          path: "/admin/Badges",
          icon: "workspace_premium",
        },
        {
          label: "Notifications",
          path: "/admin/notifications",
          icon: "notifications",
          danger: true,
        },
        { label: "Paramètres ", path: "/admin/settings", icon: "settings" },
      ],
    },
  ],

  STUDENT: [
    {
      section: "TABLEAU DE BORD",
      items: [
        { label: "Vue d'ensemble", path: "/student", icon: "dashboard" },
        { label: "Mon profil", path: "/student/profile", icon: "person" },
      ],
    },

    {
      section: "ACADÉMIQUE",
      items: [
        {
          label: "Mes projets",
          path: "/student/projects",
          icon: "folder_open",
        },
        { label: "Stages", path: "/student/stages", icon: "business_center" },
        {
          label: "Activités parascolaires",
          path: "/student/activities",
          icon: "event",
        },
        {
          label: "Compétences",
          path: "/student/competances",
          icon: "psychology",
        },
        {
          label: "Mes Badges ",
          path: "/student/badges",
          icon: "workspace_premium",
        },
      ],
    },

    {
      section: "PORTFOLIO",
      items: [
        {
          label: "Portfolio public",
          path: "/student/portfolio",
          icon: "contact_page",
        },
        { label: "Mon GitHub", path: "/student/github", icon: "hub" },
      ],
    },

    {
      section: "INTERACTIONS",
      items: [
        {
          label: "Recommandations",
          path: "/student/recommendations",
          icon: "recommend",
        },
        {
          label: "Lettres de reco.",
          path: "/student/recommendation-letters",
          icon: "history_edu",
        },
        {
          label: "Commentaires",
          path: "/student/comments",
          icon: "forum",
        },
      ],
    },

    {
      section: "SYSTÈME",
      items: [
        {
          label: "Notifications",
          path: "/student/notifications",
          icon: "notifications",
        },
        {
          label: "Paramètres",
          path: "/student/settings",
          icon: "settings",
        },
      ],
    },
  ],

  PROFESSOR: [
    {
      section: "TABLEAU DE BORD",
      items: [
        { label: "Vue globale", path: "/professor", icon: "dashboard" },
        { label: "Mon profil", path: "/professor/profile", icon: "person" },
        {
          label: "Validations",
          path: "/professor/validations",
          icon: "fact_check",
        },
      ],
    },
    {
      section: "SYSTÈME",
      items: [
        {
          label: "Notifications",
          path: "/professor/notifications",
          icon: "notifications",
        },
        {
          label: "Paramètres",
          path: "/professor/settings",
          icon: "settings",
        },
      ],
    },
    {
      section: "SYSTÈME",
      items: [
        {
          label: "Notifications",
          path: "/professor/notifications",
          icon: "notification.svg",
        },
        
      ],
    },
  ],

  PROFESSIONAL: [
    {
      section: "TABLEAU DE BORD",
      items: [
        { label: "Vue globale", path: "/professional", icon: "dashboard" },
        { label: "Explore Profiles", path: "/profiles", icon: "manage_search" },
      ],
    },
    {
      section: "SYSTÈME",
      items: [
        {
          label: "Notifications",
          path: "/professional/notifications",
          icon: "notifications",
        },
      ],
    },
    {
      section: "SYSTÈME",
      items: [
        {
          label: "Notifications",
          path: "/professional/notifications",
          icon: "notification.svg",
        },
        
      ],
    },
  ],
};
