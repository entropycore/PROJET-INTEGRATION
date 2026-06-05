describe('Gestion des Utilisateurs - Tableau Admin E2E Tests (Mode Ralenti)', () => {
  const DELAY = 1500; // Pause d'observation

  // Mock initial des données de pagination et liste
  const mockStudentsResponse = {
    data: {
      items: [
        {
          id: 'usr_student_1',
          firstName: 'Safae',
          lastName: 'Douae',
          email: 's.douae@ensa.ma',
          phone: '0611223344',
          role: 'STUDENT',
          accountStatus: 'ACTIVE',
          createdAt: '2026-01-10T09:00:00.000Z',
          lastLoginAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 min ago
          roleDetails: { student: { major: 'Génie Informatique', level: 'CI1' } }
        },
        {
          id: 'usr_recruiter_2',
          firstName: 'Najim',
          lastName: 'Recruiter',
          email: 'najim@company.ma',
          phone: '0655667788',
          role: 'PROFESSIONAL',
          accountStatus: 'PENDING',
          createdAt: '2026-05-01T12:00:00.000Z',
          lastLoginAt: null, // Jamais
          roleDetails: { professional: { company: 'OCP Group', jobTitle: 'QA Engineer Manager' } }
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1
      }
    }
  };

  beforeEach(() => {
    // Intercepter l'appel API global par défaut lors du montage du composant
    cy.intercept('GET', '**/services/adminService/users*', mockStudentsResponse).as('getUsers');

    cy.visit('/admin/users');
    cy.wait('@getUsers');
    cy.wait(DELAY);
  });

  it('devrait afficher les titres et les colonnes de base correctement', () => {
    cy.get('h1').should('contain', 'Gestion des utilisateurs');
    
    // Vérifier la présence des colonnes génériques du tableau
    cy.get('.users-table thead th').should('contain', 'User');
    cy.get('.users-table thead th').should('contain', 'Email');
    cy.get('.users-table thead th').should('contain', 'Status');
    
    // Vérifier les lignes injectées
    cy.get('.users-table tbody tr').should('have.length', 2);
    cy.get('.users-table').should('contain', 'Safae Douae');
    cy.get('.users-table').should('contain', 'il y a 5 min');
    cy.get('.users-table').should('contain', 'Jamais');
  });

  it('devrait gérer la recherche textuelle avec le debounce de 400ms', () => {
    // Préparer un mock spécifique pour le filtrage
    cy.intercept('GET', '**/services/adminService/users*search=Safae*', {
      data: {
        items: [mockStudentsResponse.data.items[0]],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
      }
    }).as('searchUser');

    // Saisir une chaîne dans la barre de recherche
    cy.get('.users-search input').type('Safae', { delay: 150 });
    
    // Attendre que le timeout du debounce (400ms) s'écoule et déclenche l'API
    cy.wait('@searchUser');
    cy.wait(DELAY);

    // Le tableau doit maintenant ne contenir qu'une seule ligne
    cy.get('.users-table tbody tr').should('have.length', 1);
    cy.get('.users-table').should('contain', 'Safae Douae');
    cy.get('.users-table').should('not.contain', 'Najim Recruiter');
  });

  it('devrait basculer dynamiquement les colonnes selon le rôle (ex: STUDENT via Query Params)', () => {
    // Si la route possède le paramètre ?role=STUDENT
    cy.intercept('GET', '**/services/adminService/users*role=STUDENT*', mockStudentsResponse).as('getStudentsOnly');
    
    // On simule le passage par l'URL filtrée
    cy.visit('/admin/users?role=STUDENT');
    cy.wait('@getStudentsOnly');
    cy.wait(DELAY);

    // Vérifier l'injection dynamique de "Major" et "Level" dans le header
    cy.get('.users-table thead th').should('contain', 'Major');
    cy.get('.users-table thead th').should('contain', 'Level');
    cy.get('.users-table tbody').should('contain', 'Génie Informatique');
  });

  it('devrait ouvrir le menu d’actions et valider le cycle d’acceptation d’un recruteur PENDING', () => {
    cy.intercept('POST', '**/services/adminService/usr_recruiter_2/approve', { statusCode: 200 }).as('approveRecruiter');
    // On re-mock l'actualisation après acceptation
    cy.intercept('GET', '**/services/adminService/users*', mockStudentsResponse).as('refreshUsers');

    // Trouver le bouton trigger du menu actions pour l'utilisateur 2 (Najim)
    // On cible la deuxième ligne du tableau
    cy.get('.users-table tbody tr').eq(1).within(() => {
      cy.get('.actions-trigger').click();
    });
    cy.wait(500); // Laisse le dropdown s'ouvrir

    // Vérifier que les boutons contextuels "Accepter" et "Rejeter" apparaissent (car ROLE === PROFESSIONAL et STATUS === PENDING)
    cy.get('.actions-dropdown-menu').should('be.visible');
    cy.get('.actions-dropdown-menu button').contains('Accepter').click();

    cy.wait('@approveRecruiter');
    cy.wait('@refreshUsers');
    cy.wait(DELAY);
  });

  it('devrait simuler l’importation d’un fichier CSV d’utilisateurs', () => {
    const mockCsvContent = 'firstName,lastName,email,phone,role\nTest,User,test@ensa.ma,0611111111,STUDENT';
    
    // Mock de la réponse du service d'importation
    cy.intercept('POST', '**/services/adminService/import-csv', {
      statusCode: 200,
      body: {
        data: {
          createdCount: 1,
          failedCount: 0
        }
      }
    }).as('importCsv');

    // Utilisation de la commande selectFile de Cypress pour injecter un fichier virtuel
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from(mockCsvContent),
      fileName: 'users_import.csv',
      mimeType: 'text/csv'
    }, { force: true }); // force car la classe est 'visually-hidden'

    cy.wait('@importCsv');
    cy.get('.users-import-result').should('contain', '1 utilisateur(s) importe(s), 0 erreur(s).');
    cy.wait(DELAY);
  });

  it('devrait gérer la redirection vers la création d’un nouvel utilisateur', () => {
    cy.get('.primary-action').contains('+ New User').click();
    cy.url().should('include', '/admin/users/create');
  });
});