describe('Parcours E2E - Détails d\'un Projet (Vrai Backend)', () => {
  const projectIdToTest = '123'; // À remplacer par un ID existant dans ta DB de test

  beforeEach(() => {
    // 1. Session d'authentification étudiante
    cy.session('student-session', () => {
      cy.visit('/login');
      cy.get('input[type="email"]').type('student.test@ensat.ma');
      cy.get('input[type="password"]').type('PasswordValid123!');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    // 2. Intercepter l'appel API réel des détails du projet et des fichiers binaires
    cy.intercept('GET', `**/api/projects/${projectIdToTest}`).as('getProjectDetails');
    cy.intercept('GET', `**/api/projects/${projectIdToTest}/media/**`).as('getProjectMedia');
    cy.intercept('DELETE', `**/api/projects/${projectIdToTest}`).as('deleteProjectApi');

    // 3. Naviguer directement vers la page des détails du projet
    cy.visit(`/student/projects/${projectIdToTest}`);
  });

  it('Devrait charger les détails réels, valider l\'UI principale et le comportement des screenshots', () => {
    // Vérifier l'état de chargement initial
    cy.get('.details-state').should('contain.text', 'Chargement du projet...');

    // Attendre la réponse du serveur
    cy.wait('@getProjectDetails').then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
      const projectData = interception.response.body.data;

      cy.get('.project-title').should('contain.text', projectData.title);
      cy.get('.project-type-badge').should('contain.text', projectData.type);
      cy.get('.project-full-description').should('contain.text', projectData.description);

      if (projectData.githubUrl) {
        cy.get('.project-link-item').contains('GitHub Repository')
          .should('have.attr', 'href', projectData.githubUrl)
          .and('have.attr', 'target', '_blank');
      }

      if (projectData.attachments && projectData.attachments.length > 0) {
        cy.get('.attachment-card').should('have.length', projectData.attachments.length);
        cy.get('.attachment-card').first().find('a.secondary-action').should('have.attr', 'target', '_blank');
      } else {
        cy.get('.attachments-list .empty-section-message').should('contain.text', 'Aucune pièce jointe ajoutée.');
      }
      if (projectData.validationHistory && projectData.validationHistory.length > 0) {
        cy.get('.timeline-item').should('have.length', projectData.validationHistory.length);
        // Le premier élément doit être le plus récent (trié par computed)
        const sorted = [...projectData.validationHistory].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        cy.get('.timeline-item').first().find('.timeline-header strong').should('contain.text', sorted[0].title);
      }
      if (projectData.screenshots && projectData.screenshots.length > 0) {
        // Attendre que l'application télécharge le contenu binaire de l'image
        cy.wait('@getProjectMedia');
        
        cy.get('.screenshots-grid button').first().then(($btn) => {
          const img = $btn.find('img');
          if (img.length > 0) {
            // Si l'API a renvoyé un blob valide, l'attribut src doit commencer par "blob:"
            cy.wrap(img).should('have.attr', 'src').and('match', /^blob:/);
          } else {
            // Si l'image a planté (@error), le placeholder s'affiche
            cy.wrap($btn).find('.screenshot-placeholder').should('exist');
          }
        });
      }
    });
  });

  it('Devrait afficher dynamiquement les actions et la zone de suppression selon le statut de validation', () => {
    cy.wait('@getProjectDetails').then((interception) => {
      const status = interception.response.body.data.validationStatus;

      if (['DRAFT', 'CHANGES_REQUESTED'].includes(status)) {
        // Le bouton Modifier et la zone de suppression doivent être visibles
        cy.get('.project-header-actions .secondary-action').contains('Modifier').should('exist');
        cy.get('.delete-project-card').should('exist');
      } else if (status === 'APPROVED' || status === 'PENDING') {
        // Pas modifiable ni supprimable
        cy.get('.project-header-actions .secondary-action').contains('Modifier').should('not.exist');
        cy.get('.delete-project-card').should('not.exist');
      } else if (status === 'REJECTED') {
        // Un projet refusé peut être supprimé mais pas modifié directement sans repasser par un autre état
        cy.get('.project-header-actions .secondary-action').contains('Modifier').should('not.exist');
        cy.get('.delete-project-card').should('exist');
      }
    });
  });

  it('Devrait gérer l\'annulation et la confirmation de la suppression définitive', () => {
    cy.wait('@getProjectDetails').then((interception) => {
      const status = interception.response.body.data.validationStatus;
      
      // On n'exécute ce test que si le projet actuel est dans un état supprimable
      if (!['DRAFT', 'CHANGES_REQUESTED', 'REJECTED'].includes(status)) return;

      // Cas 1 : L'étudiant clique sur "Supprimer" mais fait "Annuler" sur la boîte de dialogue
      cy.on('window:confirm', (str) => {
        expect(str).to.equal('Supprimer définitivement ce projet ?');
        return false; // Équivaut à cliquer sur "Annuler"
      });
      cy.get('.delete-project-button').click();
      cy.url().should('include', `/student/projects/${projectIdToTest}`); // On reste sur la page

      // Cas 2 : L'étudiant confirme la suppression
      cy.removeAllListeners('window:confirm'); // Nettoyer l'écouteur précédent
      cy.on('window:confirm', () => {
        return true; // Équivaut à cliquer sur "OK"
      });

      cy.get('.delete-project-button').click();
      
      // Vérifier que l'API DELETE a bien reçu la requête et a répondu avec succès
      cy.wait('@deleteProjectApi').then((delInterception) => {
        expect(delInterception.response.statusCode).to.be.oneOf([200, 204]);
      });

      // Redirection automatique vers la liste des projets après suppression
      cy.url().should('match', /\/student\/projects$/);
    });
  });
});