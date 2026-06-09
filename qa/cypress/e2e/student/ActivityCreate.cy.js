describe("Parcours E2E - Creation d'activite parascolaire avec vrai backend", () => {
  beforeEach(() => {
    cy.session('student-activity-session', () => {
      cy.visit('/login');
      cy.get('input[type="email"]').type('student.activity@ensat.ma');
      cy.get('input[type="password"]').type('PasswordValid123!');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    cy.intercept('POST', '**/api/student/activities').as('createActivityApi');
    cy.intercept('POST', '**/api/student/activities/*/certificate').as('uploadCertificateApi');

    cy.visit('/student/activities/create');
  });

  it("remplit le formulaire, upload l'attestation et redirige vers les details", () => {
    cy.get('input[name="title"], [placeholder*="titre"]').type('Organisation SOLI-Hackathon 2026');
    cy.get('input[name="organization"], [placeholder*="organisation"]').type('Club Humanitaire ENSAT');
    cy.get('textarea[name="description"]').type("Responsable logistique et membre du comite d'organisation de l'evenement.");
    cy.get('select[name="type"]').select('HUMANITARIAN');
    cy.get('input[type="file"][name="certificate"]').selectFile('cypress/fixtures/attestation.pdf');

    cy.get('button[type="submit"]').contains("Creer l'activite").click();
    cy.get('button[type="submit"]').should('contain', 'Creation...');

    cy.wait('@createActivityApi').then((interception) => {
      expect([200, 201]).to.include(interception.response.statusCode);

      const responseBody = interception.response.body.data || interception.response.body;
      const createdId = responseBody.id;
      const requestPayload = interception.request.body;

      expect(requestPayload.certificate).to.be.undefined;
      expect(requestPayload.certificateName).to.be.undefined;
      expect(requestPayload.certificateUrl).to.be.undefined;

      cy.wait('@uploadCertificateApi').its('response.statusCode').should('eq', 200);
      cy.url().should('include', `/student/activities/${createdId}`);
    });
  });

  it('recoit une erreur de validation du vrai backend pour un payload invalide', () => {
    const apiBaseUrl = Cypress.env('API_BASE_URL') || 'http://localhost:3000';

    cy.request({
      method: 'POST',
      url: `${apiBaseUrl}/api/student/activities`,
      body: {},
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.be.oneOf([400, 422]);
      expect(response.body?.success).to.not.eq(true);
    });
  });

  it('retourne a la page precedente lors du clic sur Annuler ou Retour', () => {
    cy.get('.back-btn').click();
    cy.url().should('include', '/student/activities');
    cy.url().should('not.include', '/create');
  });
});
