describe('Parcours E2E - Création d\'Activité Parascolaire avec Upload d\'Attestation', () => {

  beforeEach(() => {
    // 1. Authentification via Session Cypress
    cy.session('student-session', () => {
      cy.visit('/login');
      cy.get('input[type="email"]').type('student.activity@ensat.ma');
      cy.get('input[type="password"]').type('PasswordValid123!');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    // 2. Intercepter les appels API vers le vrai backend
    cy.intercept('POST', '**/api/student/activities').as('createActivityApi');
    cy.intercept('POST', '**/api/student/activities/*/certificate').as('uploadCertificateApi');

    // 3. Naviguer vers la page de création
    cy.visit('/student/activities/create');
  });

  it('Devrait remplir le formulaire, uploader l\'attestation et rediriger vers les détails', () => {
    
    // Remplissage des champs textuels du ActivityForm
    cy.get('input[name="title"], [placeholder*="titre"]').type('Organisation SOLI-Hackathon 2026');
    cy.get('input[name="organization"], [placeholder*="organisation"]').type('Club Humanitaire ENSAT');
    cy.get('textarea[name="description"]').type('Responsable logistique et membre du comité d\'organisation de l\'événement.');
    
    // Sélectionner un type d'activité si c'est un select
    cy.get('select[name="type"]').select('HUMANITARIAN');

    // Ton code vérifie "payload.certificate instanceof File". 
    // .selectFile() de Cypress génère exactement un objet File natif dans le DOM.
    // Assure-toi d'avoir le fichier dans 'cypress/fixtures/attestation.pdf'
    cy.get('input[type="file"][name="certificate"]')
      .selectFile('cypress/fixtures/attestation.pdf');

    // Cliquer sur le bouton de soumission
    cy.get('button[type="submit"]').contains('Créer l’activité').click();

    // Vérifier l'état visuel immédiat (isSaving = true)
    cy.get('button[type="submit"]').should('contain', 'Création...');

    // Synchronisation et validation du premier appel (Création de l'activité)
    cy.wait('@createActivityApi').then((interception) => {
      expect([200, 201]).to.include(interception.response.statusCode);
      
      const responseBody = interception.response.body.data || interception.response.body;
      const createdId = responseBody.id;

      // Validation de ta règle métier (Nettoyage du payload via buildActivityPayload)
      const requestPayload = interception.request.body;
      expect(requestPayload.certificate).to.be.undefined;
      expect(requestPayload.certificateName).to.be.undefined;
      expect(requestPayload.certificateUrl).to.be.undefined;

      // Attendre la deuxième requête d'upload physique qui utilise l'ID généré
      cy.wait('@uploadCertificateApi').its('response.statusCode').should('eq', 200);

      // Vérifier la redirection dynamique finale vers la page de détails du projet
      cy.url().should('include', `/student/activities/${createdId}`);
    });
  });

  it('Devrait gérer l\'échec de création et afficher le message d\'erreur du serveur', () => {
    // Simuler une erreur 400 (ex: Titre déjà existant ou données invalides) renvoyée par le serveur
    const backendErrorMessage = "Le champ titre est obligatoire ou déjà utilisé.";
    
    cy.intercept('POST', '**/api/student/activities', {
      statusCode: 400,
      body: { message: backendErrorMessage }
    }).as('createActivityError');

    // Remplir un champ pour pouvoir soumettre
    cy.get('input[name="title"]').type('Activité Invalide');
    cy.get('button[type="submit"]').click();

    cy.wait('@createActivityError');

    // Vérifier que isSaving repasse à false et que errorMessage s'affiche proprement f la UI
    cy.get('.error-msg')
      .should('be.visible')
      .and('contain', backendErrorMessage);
      
    cy.get('button[type="submit"]').should('contain', 'Créer l’activité');
  });

  it('Devrait retourner à la page précédente lors du clic sur Annuler ou Retour', () => {
    // Tester le bouton Retour du wrapper
    cy.get('.back-btn').click();
    cy.url().should('include', '/student/activities');
    cy.url().should('not.include', '/create');
  });
});