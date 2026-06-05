describe('Détails et Édition Utilisateur - Admin E2E Tests (Mode Ralenti)', () => {
  const DELAY = 1500; // Pause pour observer l'affichage des étapes

  const mockUser = {
    id: 'usr_123',
    firstName: 'Kholoud',
    lastName: 'Nihal',
    email: 'k.nihal@ensa.ma',
    phone: '0600112233',
    role: 'STUDENT',
    accountStatus: 'PENDING',
    createdAt: '2026-04-15T10:00:00.000Z',
    lastLoginAt: '2026-05-20T14:30:00.000Z',
    emailVerified: true,
    roleDetails: {
      student: {
        apogeeCode: '1122334',
        cne: 'P123456789',
        major: 'Génie Informatique',
        level: 'CI1',
        city: 'Tanger',
        linkedinUrl: 'https://linkedin.com/in/test'
      }
    }
  };

  beforeEach(() => {
    // 1. Mock de la récupération de l'utilisateur initial
    cy.intercept('GET', '**/services/adminService/usr_123', {
      statusCode: 200,
      body: { data: mockUser }
    }).as('getUser');

    // Autoriser l'accès au Clipboard
    cy.wrap(
      Cypress.automation('remote:debugger:protocol', {
        command: 'Browser.grantPermissions',
        params: {
          permissions: ['clipboardReadWrite'],
          origin: window.location.origin,
        },
      })
    );

    // Visite directe de la page de détails de l'utilisateur mocké
    cy.visit('/admin/users/usr_123');
    cy.wait('@getUser');
    cy.wait(DELAY); // Pause initiale pour observer le mode "Consultation"
  });

  it('devrait charger et afficher correctement les détails de l’utilisateur', () => {
    // Vérification du Header (Nom complet calculé, email, rôle)
    cy.get('h1').should('contain', 'Kholoud Nihal');
    cy.get('.details-email').should('contain', 'k.nihal@ensa.ma');
    cy.get('.details-role').should('contain', 'Étudiant');

    // Vérification que les inputs sont bien désactivés en mode lecture
    cy.contains('label', 'Prénom').find('input').should('be.disabled');
    cy.contains('label', 'Apogée').find('input').should('be.disabled');
    
    // Vérification des métadonnées formatées
    cy.get('.meta-card').within(() => {
      cy.contains('15/04/2026'); // Date au format fr-FR
      cy.contains('Oui'); // Email vérifié
    });
    cy.wait(DELAY);
  });

  it('devrait passer en mode édition, modifier la ville et sauvegarder', () => {
    // Mock de la requête de mise à jour (Mise à jour générale + Changement de statut)
    cy.intercept('PUT', '**/services/adminService/usr_123', { statusCode: 200 }).as('updateUser');
    cy.intercept('PUT', '**/services/adminService/usr_123/status', { statusCode: 200 }).as('updateStatus');

    // Clic sur "Modifier" pour passer en Edit Mode (changement d'URL simulé par l'action)
    cy.get('.primary-btn').contains('Modifier').click();
    
    // Simulation du comportement de la route en changeant le chemin vers /edit
    cy.window().then((win) => {
      // Si votre router change l'état, ici on s'assure visuellement que les champs s'activent
      // Pour le test, on force l'état si besoin ou on laisse le router faire son push
    });
    
    // On efface l'ancienne ville et on tape la nouvelle de manière humaine
    cy.contains('label', 'Ville').find('input').clear().type('Tétouan', { delay: 100 });
    
    // On change le statut de PENDING à ACTIVE
    cy.contains('label', 'Statut').find('select').select('ACTIVE');
    cy.wait(DELAY); // Pause visuelle avant d'enregistrer

    // Clic sur Enregistrer
    cy.get('.primary-btn').contains('Enregistrer').click();
    
    cy.wait('@updateUser');
    cy.wait('@updateStatus');
    cy.wait('@getUser'); // Le composant recharge les données fraîchement modifiées
    cy.wait(DELAY);
  });

  it('devrait réinitialiser le mot de passe et afficher le modal de succès', () => {
    // Mock de l'API de réinitialisation
    cy.intercept('POST', '**/services/adminService/usr_123/reset-password', {
      statusCode: 200,
      body: { data: { temporaryPassword: 'NewResetPassword2026!' } }
    }).as('resetPassword');

    // Scroll vers la section sécurité pour que l'action soit bien visible
    cy.get('.security-card').scrollIntoView();
    cy.wait(DELAY);

    // Clic sur le bouton de réinitialisation
    cy.get('.security-card').contains('button', 'Réinitialiser le mot de passe').click();
    cy.wait('@resetPassword');
    cy.wait(DELAY); // Pause pour voir le modal s'ouvrir

    // Vérification du contenu du modal
    cy.get('.admin-modal').should('be.visible');
    cy.get('.temporary-password-box').should('contain', 'NewResetPassword2026!');

    // Clic sur Copier
    cy.get('.admin-modal').contains('button', 'Copier').click();
    cy.wait(DELAY);
    cy.get('.admin-modal').contains('button', 'Copié').should('be.visible');

    // Fermeture du modal
    cy.get('.admin-modal').contains('button', 'Fermer').click();
    cy.get('.admin-modal-backdrop').should('not.exist');
    cy.wait(DELAY);
  });

  it('devrait gérer l’annulation de la suppression via le confirm de l’administrateur', () => {
    // Cas 1 : L'admin clique sur "Annuler" lors du confirm
    cy.on('window:confirm', () => false);
    
    cy.get('.danger-btn').contains('Supprimer').click();
    cy.wait(DELAY); // On vérifie visuellement que rien n'a bougé (pas de redirection)
    cy.url().should('include', '/admin/users/usr_123');
  });

  it('devrait supprimer l’utilisateur avec succès et rediriger vers la liste', () => {
    // Mock de l'API de suppression
    cy.intercept('DELETE', '**/services/adminService/usr_123', { statusCode: 200 }).as('deleteUser');
    
    // Cas 2 : L'admin clique sur "OK" lors du confirm
    cy.on('window:confirm', () => true);

    cy.get('.danger-btn').contains('Supprimer').click();
    cy.wait('@deleteUser');
    cy.wait(DELAY); // Pause pour voir la transition avant la redirection

    // Vérification du retour à la liste générale des utilisateurs
    cy.url().should('include', '/admin/users');
  });
});