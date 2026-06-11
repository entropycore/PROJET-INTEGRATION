describe('Parcours E2E - Création et Soumission de Projet (Vrai Backend)', () => {

  // Générer un titre unique pour éviter les doublons stricts dans le vrai backend
  const uniqueTitle = `Projet E2E Innovant - ${Date.now()}`;

  beforeEach(() => {
    cy.intercept('GET', '**/api/student/validators').as('getValidators');
    cy.intercept('POST', '**/api/projects').as('createProject');
    cy.intercept('POST', '**/api/projects/*/media').as('uploadMedia');
    cy.intercept('PATCH', '**/api/projects/*/submit').as('submitProject');

    cy.loginAsStudent('/student/projects/create');
  });

  it.skip('Devrait remplir tout le formulaire complexe, ajouter les techs/liens, uploader les médias, et soumettre au vrai backend', () => {
    
    // ---------------------------------------------------
    // 1. ATTEINDRE ET VERIFIER LES VALIDATEURS (AUTOCOMPLETE)
    // ---------------------------------------------------
    cy.wait('@getValidators').then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });

    // ---------------------------------------------------
    // 2. REMPLIR LES INFORMATIONS PRINCIPALES
    // ---------------------------------------------------
    cy.get('input[placeholder="Titre du projet"]').type(uniqueTitle);
    
    cy.get('select').select('Hackathon'); // Tester le changement de type
    
    cy.get('textarea[placeholder="Décrivez le projet..."]').type(
      'Ceci est une description générée par un test automatisé Cypress E2E connecté au vrai backend de l’application.'
    );
    
    cy.get('input[placeholder="Ex: Dev Fullstack"]').type('Lead Architect & Backend Dev');
    cy.get('input[placeholder="Ex: 4 membres"]').type('3 membres');

    // ---------------------------------------------------
    // 3. TESTER L'AUTOCOMPLETE DYNAMIQUE DU VALIDATEUR
    // ---------------------------------------------------
    // On tape le début d'un nom (par exemple "Karim" ou juste "a")
    cy.get('input[placeholder="Tapez le nom du validateur"]').type('Ghailani');
    
    // La liste des suggestions doit s'ouvrir suite au focus/input
    cy.get('.suggestions-list').should('be.visible');
    
    // On sélectionne le premier validateur renvoyé par le vrai backend
    cy.get('.suggestion-item').first().click();
    
    // S'assurer que le warning card disparaît car les champs obligatoires (Titre, Desc, Validateur) sont remplis
    cy.get('.edit-warning-card').should('not.exist');

    // ---------------------------------------------------
    // 4. AJOUT DYNAMIQUE DE TECHNOLOGIES (CHIPS)
    // ---------------------------------------------------
    cy.get('input[placeholder="Ajouter une technologie"]').type('Vue.js{enter}');
    cy.get('input[placeholder="Ajouter une technologie"]').type('Cypress{enter}');
    cy.get('input[placeholder="Ajouter une technologie"]').type('Spring Boot');
    cy.get('.inline-add-form').contains('Ajouter').click();

    // Vérifier que les pills ont été injectés dans le DOM
    cy.get('.project-tech-pill').should('have.length', 3);
    
    // Tester la suppression d'une technologie
    cy.get('.project-tech-pill').contains('Cypress').find('button').click();
    cy.get('.project-tech-pill').should('have.length', 2);

    // ---------------------------------------------------
    // 5. AJOUT DE LIENS PERSONNALISÉS
    // ---------------------------------------------------
    cy.get('input[placeholder="Nom du lien"]').type('Documentation API');
    cy.get('input[placeholder="https://..."]').last().type('https://api.credencia.ma/docs');
    cy.get('.inline-add-form.two-inputs').contains('Ajouter').click();

    cy.get('.extra-link-item').should('have.length', 1)
      .and('contain.text', 'Documentation API');

    // ---------------------------------------------------
    // 6. UPLOAD DES CAPTURES D'ÉCRAN & PIÈCES JOINTES (VRAIS FICHIERS)
    // ---------------------------------------------------
    // Cypress simule un vrai drop/upload de fichiers binaires à l'aide de `selectFile`
    cy.get('input[type="file"][accept="image/*"]').selectFile({
      contents: Cypress.Buffer.from('fake-image-binary'),
      fileName: 'screenshot-e2e.png',
      mimeType: 'image/png',
    }, { force: true });

    cy.get('input[type="file"]').not('[accept="image/*"]').selectFile({
      contents: Cypress.Buffer.from('fake-pdf-binary'),
      fileName: 'cahier-des-charges.pdf',
      mimeType: 'application/pdf',
    }, { force: true });

    // Vérification de l'affichage local avant envoi
    cy.get('.uploaded-list').should('have.length', 2);
    cy.get('.uploaded-item').contains('screenshot-e2e.png');
    cy.get('.uploaded-item').contains('cahier-des-charges.pdf');

    // ---------------------------------------------------
    // 7. SOUUMISSION FINALE AU BACKEND (CRÉER ET SOUMETTRE)
    // ---------------------------------------------------
    // Le bouton "Créer et soumettre" doit être actif maintenant
    cy.get('.primary-action').contains('Créer et soumettre')
      .should('not.be.disabled')
      .click();

    // Attendre le chainage des appels API réels du backend
    // Étape A: Création du projet (POST /api/projects)
    cy.wait('@createProject').then((interception) => {
      expect(interception.response.statusCode).to.be.oneOf([200, 201]);
      const createdProject = interception.response.body.data || interception.response.body;
      expect(createdProject.id).to.exist;
    });

    // Étape B: Upload des fichiers (POST /api/projects/:id/media)
    cy.wait('@uploadMedia').then((interception) => {
      expect(interception.response.statusCode).to.be.oneOf([200, 201]);
    });

    // Étape C: Passage du statut de DRAFT à SUBMITTED (POST /api/projects/:id/submit)
    cy.wait('@submitProject').then((interception) => {
      expect(interception.response.statusCode).to.be.oneOf([200, 201]);
    });

    // ---------------------------------------------------
    // 8. VERIFICATION DE LA REDIRECTION ROUTER
    // ---------------------------------------------------
    // Le vrai backend a répondu positivement, Vue déclenche `router.push("/student/projects")`
    cy.url().should('include', '/student/projects');
  });
});
