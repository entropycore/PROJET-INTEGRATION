describe('Parcours E2E - Formulaire de Stage (Création, Modification & Upload Réel)', () => {

  beforeEach(() => {
    // 1. Authentification unique via Session
    cy.session('student-session', () => {
      cy.visit('/login');
      cy.get('input[type="email"]').type('student.stage@ensat.ma');
      cy.get('input[type="password"]').type('PasswordValid123!');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    // 2. Intercepter les VRAIS appels API pour synchroniser Cypress avec le Backend
    cy.intercept('GET', '**/api/student/validators').as('getValidators');
    cy.intercept('POST', '**/api/student/stages').as('createStage');
    cy.intercept('POST', '**/api/student/stages/*/reports').as('uploadReport');
    cy.intercept('POST', '**/api/student/stages/*/images').as('uploadImages');
    cy.intercept('POST', '**/api/student/stages/*/submit').as('submitValidation');
  });

  it('Devrait remplir le formulaire, uploader de vrais fichiers et enregistrer un brouillon', () => {
    // Accéder à la page de création
    cy.visit('/student/stages/create');

    // Attendre le chargement initial des encadrants depuis le vrai backend
    cy.wait('@getValidators').its('response.statusCode').should('eq', 200);
    cy.get('.loading-state').should('not.exist');

    cy.get('input[name="title"]').type('Stage d\'observation - Automatisation QA & DevOps');
    cy.get('input[name="company"]').type('OCP Group');
    cy.get('input[name="duration"]').type('1 mois');
    cy.get('input[name="startDate"]').type('2026-08-01');
    cy.get('input[name="endDate"]').type('2026-08-31');
    cy.get('textarea[name="description"]').type('Mise en place d\'une architecture de tests End-to-End automatisée avec Cypress.');

    // Sélectionner le vrai validateur retourné par la base de données
    // (Adapte le sélecteur selon la structure de ton composant enfant StageForm)
    cy.get('select[name="supervisor"]').select(1); 

    // Cypress utilise la commande .selectFile() pour simuler un vrai drag-and-drop ou clic d'upload
    // Ces fichiers doivent idéalement être placés dans ton dossier `cypress/fixtures/`
    
    // 1. Upload du rapport PDF
    cy.get('input[type="file"][name="report"]')
      .selectFile('cypress/fixtures/rapport_test.pdf');

    // 2. Upload des captures d'écran (Multi-fichiers)
    cy.get('input[type="file"][name="images"]')
      .selectFile([
        'cypress/fixtures/dashboard_screenshot.png',
        'cypress/fixtures/pipeline_screenshot.png'
      ]);

    // On clique sur le bouton de sauvegarde du brouillon emmitant @save-draft
    cy.get('button').contains('Enregistrer le brouillon').click();

    // S'assurer que le cycle complet des requêtes backend s'exécute avec succès (200 ou 201)
    cy.wait('@createStage').then((interception) => {
      expect([200, 201]).to.include(interception.response.statusCode);
      
      // On valide la règle métier écrite dans ton code :
      const payload = interception.request.body;
      expect(payload.visibility).to.equal('PRIVATE'); // Règle métier respectée !
    });

    // Attendre que les téléversements physiques de fichiers se terminent sur le serveur
    cy.wait('@uploadReport').its('response.statusCode').should('eq', 200);
    cy.wait('@uploadImages').its('response.statusCode').should('eq', 200);

    // Vérifier la redirection automatique après succès
    cy.url().should('include', '/student/stages');
  });

  it('Devrait gérer le mode édition et confirmer la suppression d\'une image', () => {
    const stageId = Cypress.env('E2E_EDIT_STAGE_ID') || Cypress.env('E2E_STAGE_ID');
    expect(stageId, 'E2E_EDIT_STAGE_ID ou E2E_STAGE_ID doit pointer vers un vrai stage editable').to.be.a('string').and.not.be.empty;
    
    // Intercepter le chargement du stage spécifique en mode édition
    cy.intercept('GET', `**/api/student/stages/${stageId}`).as('loadSpecificStage');
    cy.intercept('DELETE', `**/api/student/stages/${stageId}/images/*`).as('deleteImageApi');

    // Visiter la page en mode édition
    cy.visit(`/student/stages/${stageId}/edit`);
    cy.wait('@loadSpecificStage').its('response.statusCode').should('eq', 200);

    // Vérifier que le titre de la page s'est dynamiquement adapté
    cy.get('.page-header h1').should('have.text', 'Modifier le stage');

    // Modificaton d'un champ
    cy.get('input[name="title"]').clear().type('Nouveau Titre de Stage Certifié');

    // Ton code utilise window.confirm(). Par défaut, Cypress accepte automatiquement (clique sur "OK").
    // On écoute l'événement pour valider que le message affiché à l'étudiant est le bon.
    cy.on('window:confirm', (str) => {
      expect(str).to.equal('Voulez-vous vraiment supprimer cette capture ?');
      return true; // Équivaut à cliquer sur "OK"
    });

    // Déclencher l'action de suppression d'une image existante
    // (Adapte le sélecteur selon le bouton de suppression dans StageForm)
    cy.get('.delete-image-btn').first().click();

    // Valider que l'API de suppression du vrai backend a bien reçu la demande
    cy.wait('@deleteImageApi').its('response.statusCode').should('eq', 200);
    
    // Le wrapper doit re-fetcher le stage automatiquement après suppression
    cy.wait('@loadSpecificStage');
  });
});