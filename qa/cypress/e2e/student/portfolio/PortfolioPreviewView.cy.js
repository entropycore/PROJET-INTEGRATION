describe('Parcours E2E - Générateur de Portfolio (Vrai Backend)', () => {

  beforeEach(() => {
    cy.intercept('GET', '**/api/student/portfolio/preview').as('fetchPortfolioData');
    cy.intercept('POST', '**/api/student/portfolio/generate').as('generatePortfolioAPI');

    cy.loginAsStudent('/student/portfolio');
  });

  it.skip('Devrait charger la vraie data, manipuler la config, et générer le portfolio avec succès', () => {
    
    // ---------------------------------------------------
    // 1. VERIFICATION DU CHARGEMENT (REAL DATA)
    // ---------------------------------------------------
    // On attend que le premier appel API réponde avec un statut 200
    cy.wait('@fetchPortfolioData').then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
      const data = interception.response.body.data || interception.response.body;
      
      // On valide que la data reçue correspond à ce qui est affiché à l'écran
      cy.get('body').should('contain.text', data.student?.fullName || data.student?.name || 'Portfolio');
      cy.get('body').should('contain.text', String(data.credibilityScore?.score ?? ''));
    });

    // ---------------------------------------------------
    // 2. TEST DES OPTIONS GENERALES (SWITCHES)
    // ---------------------------------------------------
    // On prend le switch des compétences techniques, on clique dessus pour inverser sa valeur
    cy.get('.switch-row').contains('Afficher les compétences techniques')
      .find('input[type="checkbox"]').as('skillsCheckbox');
    
    cy.get('@skillsCheckbox').click({ force: true }); // force: true car le label englobe l'input

    // ---------------------------------------------------
    // 3. TEST DE SELECTION DES THEMES
    // ---------------------------------------------------
    // On clique sur le thème "Code Dark" par exemple
    cy.get('.theme-card').contains('Code Dark').click();
    // On s'assure qu'il prend bien la classe active
    cy.get('.theme-card').contains('Code Dark').should('have.class', 'active');
    cy.get('.theme-card').contains('Code Dark').find('.selected-badge').should('be.visible');

    // ---------------------------------------------------
    // 4. SELECTION DYNAMIQUE DES ITEMS (PROJETS & STAGES)
    // ---------------------------------------------------
    // On s'assure que les listes de projets réels sont chargées
    cy.get('.items-grid').should('be.visible');
    
    // On va chercher le premier projet valide s'il existe et on clique dessus pour le décocher/cocher
    cy.get('.selectable-item').first().then(($item) => {
      const checkbox = $item.find('input[type="checkbox"]');
      const wasChecked = checkbox.prop('checked');
      
      // Clic sur l'élément pour déclencher @click="toggleItem(...)"
      cy.wrap($item).click();
      
      // Vérification que l'état de la checkbox a bien changé f la UI
      cy.wrap(checkbox).should(wasChecked ? 'not.be.checked' : 'be.checked');
    });

    // ---------------------------------------------------
    // 5. LANCEMENT DE LA GENERATION & ENVOI AU BACKEND
    // ---------------------------------------------------
    // On clique sur le bouton principal de génération
    cy.get('.btn-primary').contains('Générer mon portfolio').should('not.be.disabled').click();

    // Le bouton doit passer en état de chargement "Génération..."
    cy.get('.btn-primary').should('contain.text', 'Génération...');

    // On attend la réponse du VRAI backend pour la génération (ça peut prendre du temps)
    // Cypress attend jusqu'à 20 secondes exprès pour cette étape lourde
    cy.wait('@generatePortfolioAPI', { timeout: 20000 }).then((interception) => {
      expect(interception.response.statusCode).to.be.oneOf([200, 201]);
    });

    // ---------------------------------------------------
    // 6. VERIFICATION DU SUCCES ET NAVIGATION FINAL
    // ---------------------------------------------------
    // Le message de succès doit apparaître
    cy.get('.success-note').should('be.visible')
      .and('contain.text', 'Votre portfolio a été généré avec succès');

    // Le deuxième bouton "Voir en plein écran" doit apparaître suite à `v-if="isGenerated"`
    cy.get('.btn-secondary').contains('Voir en plein écran').should('be.visible').click();

    // S'assurer que le routeur Vue a bien changé l'adresse vers la page finale
    cy.url().should('include', '/student/portfolio/full');
  });
});
