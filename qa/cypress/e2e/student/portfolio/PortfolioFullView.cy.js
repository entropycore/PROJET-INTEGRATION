const visitPortfolioFull = () => {
  cy.intercept("GET", "**/api/student/portfolio/preview*").as(
    "getPortfolioPreview",
  );

  cy.loginAsRoleJwt("STUDENT", "/student/portfolio/full");

  cy.wait("@getPortfolioPreview", { timeout: 20000 }).then(
    ({ response }) => {
      expect(response, "reponse GET /api/student/portfolio/preview").to.exist;
      expect(
        response.statusCode,
        `GET /api/student/portfolio/preview repond avec le vrai backend: ${JSON.stringify(response.body)}`,
      ).to.be.oneOf([200, 304, 404]);

      if (response.statusCode === 200) {
        expect(response.body, "payload portfolio").to.have.property("success");
      }
    },
  );

  cy.get(".portfolio-full-page", { timeout: 15000 }).should("be.visible");
  cy.contains("Chargement du portfolio...").should("not.exist");
};

describe("Portfolio complet etudiant - Tests E2E avec backend reel", () => {
  beforeEach(() => {
    visitPortfolioFull();
  });

  it("charge la page portfolio complet depuis le vrai backend", () => {
    cy.get(".portfolio-topbar").should("be.visible");
    cy.get(".portfolio-container").should("be.visible");
    cy.get(".portfolio-footer").should("contain.text", "Credencia");
    cy.get(".portfolio-full-page")
      .invoke("attr", "class")
      .should("include", "theme-");

    cy.contains("button", "Mon espace").should("be.visible");
    cy.contains("button", "Copier le lien").should("be.visible");
    cy.contains("button", "Exporter PDF").should("be.visible");
    cy.contains("button", "Partager").should("be.visible");
  });

  it("affiche les sections principales du portfolio si les donnees existent", () => {
    cy.contains(".portfolio-section", "Biographie").should("be.visible");

    cy.get("body").then(($body) => {
      const possibleSections = [
        "Parcours academique",
        "Competences techniques",
        "Soft skills",
        "Badges obtenus",
        "Projets valides",
        "Stages valides",
        "Activites certifiees",
        "Lettres de recommandation",
        "Recommandations",
      ];

      const visibleSectionCount = possibleSections.filter((sectionTitle) =>
        $body.text().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(
          sectionTitle,
        ),
      ).length;

      expect(visibleSectionCount, "sections portfolio visibles").to.be.gte(1);
    });
  });

  it("declenche l'export PDF avec le bouton dedie", () => {
    cy.window().then((win) => {
      cy.stub(win, "print").as("printPortfolio");
    });

    cy.contains("button", "Exporter PDF").click();
    cy.get("@printPortfolio").should("have.been.calledOnce");
  });

  it("copie le lien public du portfolio", () => {
    cy.window().then((win) => {
      if (!win.navigator.clipboard) {
        Object.defineProperty(win.navigator, "clipboard", {
          configurable: true,
          value: {},
        });
      }

      cy.stub(win.navigator.clipboard, "writeText")
        .resolves()
        .as("copyPortfolioLink");
      cy.stub(win, "alert").as("alert");
    });

    cy.contains("button", "Copier le lien").click();

    cy.get("@copyPortfolioLink").should("have.been.calledOnce");
    cy.get("@alert")
      .should("have.been.calledOnce")
      .its("firstCall.args.0")
      .should("match", /Lien copi/);
  });

  it("partage le portfolio avec le fallback clipboard si Web Share est indisponible", () => {
    cy.window().then((win) => {
      Object.defineProperty(win.navigator, "share", {
        configurable: true,
        value: undefined,
      });

      if (!win.navigator.clipboard) {
        Object.defineProperty(win.navigator, "clipboard", {
          configurable: true,
          value: {},
        });
      }

      cy.stub(win.navigator.clipboard, "writeText")
        .resolves()
        .as("shareFallbackCopy");
      cy.stub(win, "alert").as("shareFallbackAlert");
    });

    cy.contains("button", "Partager").click();

    cy.get("@shareFallbackCopy").should("have.been.calledOnce");
    cy.get("@shareFallbackAlert").should("have.been.calledOnce");
  });

  it("controle les liens externes sans quitter la page", () => {
    cy.get("body").then(($body) => {
      const externalLinks = $body
        .find('a[target="_blank"]')
        .filter((_, link) => Boolean(link.getAttribute("href")));

      if (!externalLinks.length) {
        cy.get(".portfolio-full-page").should("be.visible");
        return;
      }

      cy.wrap(externalLinks.first())
        .should("have.attr", "rel")
        .and("include", "noopener");
      cy.wrap(externalLinks.first())
        .should("have.attr", "href")
        .and("not.be.empty");
    });
  });

  it("ouvre une modale de details si un element detaille existe", () => {
    cy.get("body").then(($body) => {
      const detailsButtons = $body.find("button").filter((_, button) =>
        /Voir d.tails/.test(button.innerText),
      );

      if (!detailsButtons.length) {
        cy.get(".portfolio-full-page").should("be.visible");
        return;
      }

      cy.wrap(detailsButtons.first()).click();
      cy.get(".details-modal").should("be.visible");
      cy.get(".details-modal h2").invoke("text").should("not.be.empty");
      cy.get(".close-btn").click();
      cy.get(".details-modal").should("not.exist");
    });
  });

  it("revient vers l'espace portfolio etudiant", () => {
    cy.contains("button", "Mon espace").click();
    cy.location("pathname", { timeout: 10000 }).should(
      "eq",
      "/student/portfolio",
    );
  });
});
