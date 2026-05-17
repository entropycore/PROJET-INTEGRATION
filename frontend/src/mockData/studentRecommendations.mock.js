export const studentRecommendationsMock = {
  stats: {
    received: 3,
    pending: 2,
    rejected: 1,
  },

  recommendations: [
    {
      id: '1',
      author: {
        id: 'u1',
        name: 'Yasmine Benjelloun',
        role: 'Professionnelle',
        organization: 'Capgemini Maroc',
        profilePicture: '',
        initials: 'YB',
      },
      content:
        'Profil très prometteur, avec une bonne maîtrise des outils DevOps et une vraie capacité à apprendre rapidement.',
      status: 'RECEIVED',
      visibility: 'PUBLIC',
      read: false,
      createdAt: '2026-05-14T10:30:00.000Z',
    },
    {
      id: '2',
      author: {
        id: 'u2',
        name: 'Pr. Karim Moussaoui',
        role: 'Enseignant',
        organization: 'ENSA Tanger',
        profilePicture: '',
        initials: 'KM',
      },
      content:
        'Étudiant sérieux, curieux et impliqué dans les projets académiques. Il démontre un bon esprit d’analyse.',
      status: 'RECEIVED',
      visibility: 'PUBLIC',
      read: true,
      createdAt: '2026-05-11T15:20:00.000Z',
    },
    {
      id: '3',
      author: {
        id: 'u3',
        name: 'Imane Berrada',
        role: 'Étudiante',
        organization: 'Génie Informatique',
        profilePicture: '',
        initials: 'IB',
      },
      content:
        'Très bon esprit d’équipe. Elle aide souvent les autres membres du groupe à comprendre les parties techniques.',
      status: 'RECEIVED',
      visibility: 'PRIVATE',
      read: true,
      createdAt: '2026-05-07T09:00:00.000Z',
    },
    {
      id: '4',
      author: {
        id: 'u4',
        name: 'Nadia El Amrani',
        role: 'Recruteuse',
        organization: 'Orange Digital Center',
        profilePicture: '',
        initials: 'NA',
      },
      content:
        'Recommandation en attente de votre décision avant affichage dans votre portfolio.',
      status: 'PENDING',
      visibility: 'PRIVATE',
      read: false,
      createdAt: '2026-05-05T13:45:00.000Z',
    },
    {
      id: '5',
      author: {
        id: 'u5',
        name: 'Amine El Fassi',
        role: 'Professionnel',
        organization: 'Freelance',
        profilePicture: '',
        initials: 'AF',
      },
      content:
        'Bonne communication et sérieux dans le travail collaboratif.',
      status: 'PENDING',
      visibility: 'PRIVATE',
      read: false,
      createdAt: '2026-05-03T11:15:00.000Z',
    },
    {
      id: '6',
      author: {
        id: 'u6',
        name: 'Utilisateur signalé',
        role: 'Visiteur',
        organization: 'Portfolio public',
        profilePicture: '',
        initials: 'US',
      },
      content:
        'Recommandation refusée car elle ne respecte pas les règles de publication.',
      status: 'REJECTED',
      visibility: 'PRIVATE',
      read: true,
      createdAt: '2026-05-01T18:10:00.000Z',
    },
  ],
}