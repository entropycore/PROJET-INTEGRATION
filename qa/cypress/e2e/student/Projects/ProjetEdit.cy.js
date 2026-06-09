describe('Parcours E2E - Édition et Mise à jour de Projet Existant', () => {
  let targetProjectId;
  const updatedTitle = `Projet Édité E2E - ${Date.now()}`;

  beforeEach(() => {
    // 1. Session d'authentification étudiante
    cy.session('student-session', () => {
      cy.visit('/login');
      cy.get('input[type="email"]').type(Cypress.env('E2E_EMAIL') || 'etudiant@credencia.ma');
      cy.get('input[type="password"]').type(Cypress.env('E2E_PASSWORD') || 'Password123!');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/student');
    });

    // 2. Intercepter les appels API réels pour la synchronisation du DOM
    cy.request('/api/student/validators').then((validatorsResponse) => {
      const validators = validatorsResponse.body.data || validatorsResponse.body || [];
      expect(validators, 'validateurs disponibles').to.have.length.greaterThan(0);

      return cy.request('POST', '/api/projects', {
        title: `Projet brouillon editable E2E - ${Date.now()}`,
        type: 'Module',
        description: 'Projet brouillon cree par Cypress pour tester edition avec vrai backend.',
        role: 'Developpeur',
        teamSize: '1 membre',
        validationStatus: 'DRAFT',
        technologies: ['Vue.js'],
        extraLinks: [],
        validatorId: validators[0].id,
        validatorName: validators[0].fullName,
      });
    }).then((createResponse) => {
      const createdProject = createResponse.body.data || createResponse.body;
      targetProjectId = createdProject.id;

    cy.intercept('GET', `**/api/projects/${targetProjectId}`).as('getProjectDetail');
    cy.intercept('GET', '**/api/student/validators').as('getValidators');
    cy.intercept('PUT', `**/api/projects/${targetProjectId}`).as('updateProject'); // ou POST selon votre routage backend
    cy.intercept('DELETE', `**/api/projects/${targetProjectId}/media/*`).as('deleteMedia');
    cy.intercept('POST', `**/api/projects/${targetProjectId}/media`).as('uploadMedia');

    // 3. Naviguer direct vers la page d'édition du projet cible
    cy.visit(`/student/projects/${targetProjectId}/edit`);
    });
  });

  it('Devrait charger les données existantes, modifier les champs, gérer la suppression des anciens médias et sauvegarder', () => {
    
    cy.get('.edit-state').should('contain.text', 'Chargement du projet...');
    
    // Attendre que le projet et les validateurs soient résolus par le vrai serveur
    cy.wait(['@getProjectDetail', '@getValidators']);
    
    // S'assurer que le loader disparait et que le formulaire s'affiche
    cy.get('.edit-state').should('not.exist');
    cy.get('.project-edit-page').should('be.visible');

    // Vider l'ancien titre et taper le nouveau titre dynamique
    cy.get('input[placeholder="Titre du projet"]').clear().type(updatedTitle);
    
    // Modifier la description
    cy.get('textarea[placeholder^="Décrivez le projet"]').clear().type(
      'Mise à jour effectuée via un script de test automatisé Cypress connecté au vrai serveur.'
    );

    // Votre code déclenche un `window.confirm("Supprimer cette capture ?")` pour les fichiers non-locaux.
    // Par défaut, Cypress accepte automatiquement (renvoie `true`) tous les `confirm`.
    // On va écouter l'événement pour valider le texte de la boîte de dialogue :
    cy.on('window:confirm', (str) => {
      expect(str).to.be.oneOf([
        'Supprimer cette capture ?',
        'Supprimer cette pièce jointe ?'
      ]);
      return true; // Équivaut à cliquer sur "OK"
    });

    // S'il y a déjà des captures d'écran existantes retournées par le backend
    cy.get('.edit-side-column').then(($aside) => {
      if ($aside.find('.uploaded-list').length > 0) {
        // Cliquer sur le premier bouton Supprimer d'un média existant
        cy.get('.uploaded-list').first().find('.uploaded-item').first().find('button').click();
        
        // Valider que l'appel API DELETE a bien été envoyé et a réussi (200 ou 204)
        cy.wait('@deleteMedia').then((interception) => {
          expect(interception.response.statusCode).to.be.oneOf([200, 204]);
        });
      }
    });
    cy.get('input[type="file"][accept="image/*"]').selectFile({
      contents: Cypress.Buffer.from('new-screenshot-data'),
      fileName: 'patch-v2-screenshot.png',
      mimeType: 'image/png',
    }, { force: true });

    // Vérifier l'ajout dans la liste locale avant soumission
    cy.get('.uploaded-item').contains('patch-v2-screenshot.png').should('be.visible');

    // Cliquer sur "Enregistrer" pour déclencher `saveProject`
    cy.get('.secondary-action').contains('Enregistrer').click();

    // A. Attendre la mise à jour des métadonnées du projet (Champs texte, technologies, liens)
    cy.wait('@updateProject').then((interception) => {
      expect(interception.response.statusCode).to.be.oneOf([200, 201]);
    });

    // B. Attendre l'upload des nouveaux médias s'il y en a en attente
    cy.wait('@uploadMedia').then((interception) => {
      expect(interception.response.statusCode).to.be.oneOf([200, 201]);
    });
    // Vérifier la redirection du Vue Router vers la page de détails du projet
    cy.url().should('include', `/student/projects/${targetProjectId}`);
  });
});
