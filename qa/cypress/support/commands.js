const delaiInterface = () => Number(Cypress.env("DELAI_INTERFACE") ?? 700);
const delaiSaisie = () => Number(Cypress.env("DELAI_SAISIE") ?? 45);

Cypress.Commands.add("attendreInterface", (delai = delaiInterface()) => {
  if (delai > 0) {
    cy.wait(delai, { log: false });
  }
});

Cypress.Commands.add("visiterClairement", (url, options = {}) => {
  cy.visit(url, options);
  cy.attendreInterface();
});

Cypress.Commands.add(
  "taperClairement",
  { prevSubject: "element" },
  (subject, texte, options = {}) => {
    return cy.wrap(subject).type(texte, {
      delay: delaiSaisie(),
      ...options,
    });
  },
);

Cypress.Commands.add("loginAsAdmin", (path = "/admin/badges") => {
  cy.loginAsAdminApi(path);
});

Cypress.Commands.add("loginAsRoleApi", (role, path = "/") => {
  const apiBaseUrl = Cypress.env("API_BASE_URL") || "http://localhost:3000";
  const normalizedRole = String(role || "STUDENT").toUpperCase();
  const credentialsByRole = {
    ADMINISTRATOR: {
      email: Cypress.env("ADMIN_EMAIL"),
      password: Cypress.env("ADMIN_PASSWORD"),
    },
    STUDENT: {
      email: Cypress.env("E2E_EMAIL") || Cypress.env("STUDENT_EMAIL"),
      password: Cypress.env("E2E_PASSWORD") || Cypress.env("STUDENT_PASSWORD"),
    },
    PROFESSOR: {
      email: Cypress.env("E2E_PROF_EMAIL") || Cypress.env("PROFESSOR_EMAIL"),
      password: Cypress.env("E2E_PROF_PASSWORD") || Cypress.env("PROFESSOR_PASSWORD"),
    },
    PROFESSIONAL: {
      email: Cypress.env("PROFESSIONAL_EMAIL"),
      password: Cypress.env("PROFESSIONAL_PASSWORD"),
    },
  };
  const credentials = credentialsByRole[normalizedRole];

  expect(credentials?.email, `${normalizedRole} email Cypress env`).to.be.a("string").and.not.be.empty;
  expect(credentials?.password, `${normalizedRole} password Cypress env`).to.be.a("string").and.not.be.empty;

  cy.clearCookies();
  cy.clearLocalStorage();

  return cy.request({
    method: "POST",
    url: `${apiBaseUrl}/api/auth/login`,
    body: { email: credentials.email, password: credentials.password },
    timeout: 20000,
    failOnStatusCode: false,
  }).then((loginResponse) => {
    expect(
      loginResponse.status,
      `POST ${apiBaseUrl}/api/auth/login doit reussir avec un vrai compte ${normalizedRole}. Reponse: ${JSON.stringify(loginResponse.body)}`,
    ).to.eq(200);

    return cy.request({
      method: "GET",
      url: `${apiBaseUrl}/api/auth/me`,
      timeout: 20000,
      failOnStatusCode: false,
    });
  }).then((response) => {
    expect(
      response.status,
      `GET ${apiBaseUrl}/api/auth/me doit retourner la session apres login. Reponse: ${JSON.stringify(response.body)}`,
    ).to.eq(200);
    expect(response.body?.data?.role, "role utilisateur").to.eq(normalizedRole);

    return cy.visit(path, {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          "auth",
          JSON.stringify({
            user: response.body.data,
            isAuthenticated: true,
          })
        );
      },
    });
  });
});

Cypress.Commands.add("loginAsAdminApi", (path = "/admin") => {
  cy.loginAsRoleApi("ADMINISTRATOR", path);
});

Cypress.Commands.add("loginAsAdminJwt", (path = "/admin") => {
  cy.loginAsAdminApi(path);
});

Cypress.Commands.add("loginAsRoleJwt", (role, path = "/") => {
  cy.loginAsRoleApi(role, path);
});

Cypress.Commands.add("loginAsStudent", (path = "/student") => {
  cy.loginAsRoleApi("STUDENT", path);
});
