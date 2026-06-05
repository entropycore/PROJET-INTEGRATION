describe('Création d’Utilisateur - Admin E2E Tests (Mode Ralenti)', () => {
  const DELAY = 1500; // Pause en millisecondes entre les étapes clés

  beforeEach(() => {
    // 1. Mock de l'API de création d'utilisateur (Cas : Mot de passe généré automatiquement)
    cy.intercept('POST', '**/services/adminService*', {
      statusCode: 201,
      body: {
        data: {
          temporaryPassword: 'TempPassword2026!',
          user: {
            id: 'usr_98765',
            role: 'STUDENT',
            firstName: 'Ghizlane',
            lastName: 'Rabii'
          }
        }
      }
    }).as('createUserApi');

    // Autoriser l'accès au presse-papiers (Clipboard) dans le navigateur de test
    cy.wrap(
      Cypress.automation('remote:debugger:protocol', {
        command: 'Browser.grantPermissions',
        params: {
          permissions: ['clipboardReadWrite'],
          origin: window.location.origin,
        },
      })
    );

    // Visite de la page avec le rôle étudiant par défaut dans l'URL
    cy.visit('/admin/users/create?role=STUDENT');
    cy.wait(DELAY); // Pause pour observer l'affichage initial
  });

  it('devrait remplir le formulaire d’un Étudiant et afficher le mot de passe temporaire', () => {
    // Vérification du titre dynamique (computed property)
    cy.get('h1').should('contain', 'Créer un étudiant');

    // --- Remplissage des informations générales ---
    // Saisie ralentie ({ delay: 100 }) pour simuler une frappe humaine visible
    cy.contains('label', 'Prénom').find('input').type('Ghizlane', { delay: 100 });
    cy.contains('label', 'Nom').find('input').type('Rabii', { delay: 100 });
    cy.contains('label', 'Email').find('input').type('g.rabii@ensa.ma', { delay: 100 });
    cy.contains('label', 'Téléphone').find('input').type('0612345678', { delay: 100 });
    
    cy.wait(DELAY); // Pause pour voir la première partie remplie

    // --- Remplissage des détails spécifiques au rôle STUDENT ---
    // Si vos options se basent sur des valeurs réelles (ex: 'Génie Informatique')
    cy.contains('label', 'Filière').find('select').select(1); // Sélectionne la première filière disponible
    cy.contains('label', 'Niveau').find('input').type('CI1', { delay: 100 });
    cy.contains('label', 'Apogée').find('input').type('2200345', { delay: 100 });
    
    cy.wait(DELAY); // Pause visuelle avant la soumission

    // --- Soumission du formulaire ---
    // Clic sur le bouton principal de création
    cy.get('.primary-btn').contains('Créer utilisateur').click();
    
    // Attente de la réponse de l'API mockée
    cy.wait('@createUserApi');
    cy.wait(DELAY); // Pause pour admirer l'apparition du modal de succès

    // --- Vérifications dans le Modal d'affichage du mot de passe ---
    cy.get('.admin-modal').should('be.visible');
    cy.get('.temporary-password-box').should('contain', 'TempPassword2026!');

    // Clic sur "Copier" le mot de passe temporaire
    cy.get('.admin-modal').contains('button', 'Copier').click();
    cy.wait(DELAY);
    
    // Vérifier que le texte du bouton s'est transformé en "Copié"
    cy.get('.admin-modal').contains('button', 'Copié').should('be.visible');

    // Clic sur "Continuer" pour déclencher la redirection finale vers la fiche de l'utilisateur
    cy.get('.admin-modal').contains('button', 'Continuer').click();
    
    // Vérification que l'URL finale correspond bien à l'ID de l'utilisateur créé
    cy.url().should('include', '/admin/users/usr_98765');
  });

  it('devrait changer dynamiquement les champs visibles lors du changement de Rôle', () => {
    // 1. Changement du rôle vers "Professeur"
    cy.contains('label', 'Rôle').find('select').select('PROFESSOR');
    cy.wait(DELAY); // Pause pour voir le formulaire s'adapter

    // Vérification que le titre a changé et que les champs Professeur apparaissent
    cy.get('h1').should('contain', 'Créer un professeur');
    cy.contains('label', 'Employee ID').should('be.visible');
    cy.contains('label', 'Département').should('be.visible');
    cy.contains('label', 'Filière').should('not.exist'); // Le bloc Étudiant doit disparaître

    // 2. Changement du rôle vers "Recruteur" (Professional)
    cy.contains('label', 'Rôle').find('select').select('PROFESSIONAL');
    cy.wait(DELAY); // Pause visuelle

    cy.get('h1').should('contain', 'Créer un recruteur');
    cy.contains('label', 'Entreprise').should('be.visible');
    cy.contains('label', 'Bio').should('be.visible');
    cy.contains('label', 'Employee ID').should('not.exist');
  });

  it('devrait afficher et masquer le texte du mot de passe en cliquant sur l’icône œil', () => {
    const selector = '.password-input-wrapper input';

    // Saisie d'un mot de passe personnalisé
    cy.get(selector).type('MonMotDePasseSecret123', { delay: 100 });
    // Par défaut, l'input doit être de type "password"
    cy.get(selector).should('have.attr', 'type', 'password');
    cy.wait(DELAY);

    // Clic sur le bouton œil pour afficher le mot de passe
    cy.get('.password-toggle').click();
    // L'input doit passer en type "text" pour afficher le contenu en clair
    cy.get(selector).should('have.attr', 'type', 'text');
    cy.wait(DELAY);

    // Clic à nouveau pour le masquer
    cy.get('.password-toggle').click();
    cy.get(selector).should('have.attr', 'type', 'password');
    cy.wait(DELAY);
  });

  it('devrait afficher un message d’erreur si l’API échoue', () => {
    // Mock d'un échec réseau (Statut 400 ou 500)
    cy.intercept('POST', '**/services/adminService*', {
      statusCode: 400,
      body: { message: 'Bad Request' }
    }).as('createUserError');

    // Remplissage rapide
    cy.contains('label', 'Prénom').find('input').type('NomTest', { delay: 50 });
    cy.get('.primary-btn').click();

    cy.wait('@createUserError');
    cy.wait(DELAY);

    // Vérification de l'affichage du bandeau d'erreur rouge
    cy.get('.details-state.error')
      .should('be.visible')
      .and('contain', "Erreur lors de la création de l'utilisateur.");
  });
});