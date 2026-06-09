describe('Parcours E2E - Détails du Stage (Vrai Backend & Médias)', () => {

  let stageId;

  beforeEach(() => {
    // 1. Authentification unique via Session
    cy.session('student-session', () => {
      cy.visit('/login');
      cy.get('input[type="email"]').type(Cypress.env('E2E_EMAIL') || 'etudiant@credencia.ma');
      cy.get('input[type="password"]').type(Cypress.env('E2E_PASSWORD') || 'Password123!');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/student');
    });

    // 2. Intercepter les VRAIS appels API dyal l-backend (SANS MOCK)
    // Hadchi drori bach Cypress y-tsna le backend y-sirve la data qbel ma l-test y-clique
    cy.request('/api/student/stages').then((response) => {
      const stages = response.body.data?.items || response.body.data || response.body.items || [];
      expect(stages, 'stages existants pour le test details').to.have.length.greaterThan(0);
      stageId = stages[0].id;

    cy.intercept('GET', `**/api/student/stages/${stageId}`).as('getStageDetails');
    cy.intercept('GET', `**/api/student/stages/${stageId}/images/*`).as('getStageImage');
    cy.intercept('GET', `**/api/student/stages/${stageId}/report`).as('getStageReport');

    // 3. Naviguer vers la page de détail dyal le stage
    cy.visit(`/student/stages/${stageId}`);
    });
  });

  it('Devrait charger la vraie data, hydrater les images/PDF et valider le parcours UI', () => {
    
    // ---------------------------------------------------
    // 1. VERIFICATION DU CHARGEMENT (SYNCHRONISATION)
    // ---------------------------------------------------
    // Kantsmaw le backend y-jawb b la data dyal le stage (Status 200 OK)
    cy.wait('@getStageDetails').then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
      const stageData = interception.response.body.data || interception.response.body;
      
      // Validation dyal l-cohérence f le titre principal
      cy.get('.hero-card h1').should('contain', stageData.title);
      cy.get('.company-line strong').should('have.text', stageData.company);
    });

    // ---------------------------------------------------
    // 2. TEST DYNAMIQUE DES BOUTONS D'ACTION (ÉDITION)
    // ---------------------------------------------------
    // Le bouton "Modifier" rah lié b canEditStage computed (DRAFT ou CHANGES_REQUESTED)
    cy.get('body').then(($body) => {
      if ($body.find('.edit-btn').length > 0) {
        // Ila kan le stage editable, kan-testiw l-clic hit khasso y-di l l-page d'édition
        cy.get('.edit-btn').click();
        cy.url().should('include', `/edit`);
        // Revenir en arrière pour continuer le reste du test
        cy.go('back');
      } else {
        cy.log('Le stage est validé/en attente, le bouton modifier est bien masqué.');
      }
    });

    // ---------------------------------------------------
    // 3. RECHERCHE ET RECONNAISSANCE DES MÉDIAS (IMAGES & BLOB)
    // ---------------------------------------------------
    // Hna kan-choufo wash les images jaw men le backend w t-généra lihom URL Blob
    cy.get('body').then(($body) => {
      if ($body.find('.screens-grid').length > 0) {
        // S'assurer que les balises <img> ont bien reçu un attribut src qui commence par blob:
        cy.get('.screen-card img').first()
          .should('have.attr', 'src')
          .and('match', /^blob:/); // Véritable validation du createObjectURL dyalkom !

        // Tester le bouton "Voir toutes les images" si le composant a plus de 4 images
        if ($body.find('.view-all-btn').length > 0) {
          cy.get('.view-all-btn').click();
          // S'assurer que le modal StageImagesModal s'est ouvert f le DOM
          cy.get('.modal-content, [class*="modal"]').should('be.visible');
          // Fermer le modal
          cy.get('[class*="close"], button:contains("Fermer")').click();
        }
      } else {
        cy.get('.empty-screens').should('be.visible');
      }
    });

    // ---------------------------------------------------
    // 4. LE RAPPORT PDF (VRAI TÉLÉCHARGEMENT)
    // ---------------------------------------------------
    cy.get('body').then(($body) => {
      if ($body.find('.report-btn').length > 0) {
        // S'assurer que le bouton n'est pas bloqué par la classe .disabled
        cy.get('.report-btn').should('not.have.class', 'disabled');
        cy.get('.report-btn').should('have.attr', 'target', '_blank');
        cy.get('.report-btn').should('have.attr', 'href').and('match', /^blob:/);
      }
    });
    // Kan-testiw l-vrai historique li jristra le backend
    cy.get('.timeline').should('be.visible');
    cy.get('.timeline-item').should('have.length.greaterThan', 0);
    
    // Vérifier la structure de la première carte de l'historique
    cy.get('.timeline-card').first().within(() => {
      cy.get('h4').should('be.visible'); // Titre de l'action (ex: Stage créé)
      cy.get('time').should('be.visible'); // Date formatée
      cy.get('p').should('be.visible'); // Commentaire de l'encadrant ou l'étudiant
    });

    // ---------------------------------------------------
    // 6. RETOUR AUX STAGES (BOUTON BACK)
    // ---------------------------------------------------
    cy.get('.back-btn').click();
    cy.url().should('include', '/student/stages');
  });

});
