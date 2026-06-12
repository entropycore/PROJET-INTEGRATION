const delaiInterface = () => Number(Cypress.env("DELAI_INTERFACE") ?? 700);
const delaiSaisie = () => Number(Cypress.env("DELAI_SAISIE") ?? 45);

const usersByRole = {
  ADMINISTRATOR: {
    id: "cypress-admin-user",
    firstName: "Admin",
    lastName: "Cypress",
    email: "admin@credencia.ma",
    role: "ADMINISTRATOR",
    accountStatus: "ACTIVE",
  },
  STUDENT: {
    id: "cypress-student-user",
    firstName: "Student",
    lastName: "Cypress",
    email: "student.test@ensat.ma",
    role: "STUDENT",
    accountStatus: "ACTIVE",
  },
  PROFESSOR: {
    id: "cypress-professor-user",
    firstName: "pasprof",
    lastName: "ghailani",
    fullName: "pasprof ghailani",
    email: "pasprof.ghailani@ensat.ma",
    role: "PROFESSOR",
    accountStatus: "ACTIVE",
  },
  PROFESSIONAL: {
    id: "cypress-professional-user",
    firstName: "Professional",
    lastName: "Cypress",
    email: "professional.test@credencia.ma",
    role: "PROFESSIONAL",
    accountStatus: "ACTIVE",
  },
};

const roleIdByRole = {
  ADMINISTRATOR: Cypress.env("E2E_ADMIN_ROLE_ID") || Cypress.env("ADMIN_ROLE_ID") || 1,
  STUDENT: Cypress.env("E2E_STUDENT_ROLE_ID") || Cypress.env("STUDENT_ROLE_ID") || 1,
  PROFESSOR: Cypress.env("E2E_PROF_ROLE_ID") || Cypress.env("PROFESSOR_ROLE_ID") || 1,
  PROFESSIONAL: Cypress.env("E2E_PROFESSIONAL_ROLE_ID") || Cypress.env("PROFESSIONAL_ROLE_ID") || 1,
};

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

Cypress.Commands.add("loginAsRoleSession", (role, path = "/") => {
  const normalizedRole = String(role || "STUDENT").toUpperCase();
  const user = usersByRole[normalizedRole];

  expect(user, `session Cypress pour le role ${normalizedRole}`).to.exist;

  cy.clearCookies();
  cy.clearLocalStorage();

  return cy
    .task("signAccessToken", {
      userId: user.id,
      role: user.role,
      roleId: roleIdByRole[normalizedRole],
    })
    .then((accessToken) => {
      return cy.visit(path, {
        onBeforeLoad(win) {
          win.document.cookie = `accessToken=${accessToken}; path=/; SameSite=Strict`;
          win.localStorage.setItem(
            "auth",
            JSON.stringify({
              user,
              isAuthenticated: true,
            }),
          );
        },
      });
    });
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

  cy.session(
    ["api-login", normalizedRole, credentials.email],
    () => {
      let accessTokenCookie;

      cy.clearCookies();
      cy.clearLocalStorage();

      return cy.request({
        method: "GET",
        url: `${apiBaseUrl}/api/auth/csrf-token`,
        timeout: 20000,
        failOnStatusCode: false,
      }).then((csrfResponse) => {
        expect(
          csrfResponse.status,
          `GET ${apiBaseUrl}/api/auth/csrf-token doit reussir avant le login ${normalizedRole}. Reponse: ${JSON.stringify(csrfResponse.body)}`,
        ).to.eq(200);

        return cy.request({
          method: "POST",
          url: `${apiBaseUrl}/api/auth/login`,
          headers: {
            "x-csrf-token": csrfResponse.body?.csrfToken,
          },
          body: { email: credentials.email, password: credentials.password },
          timeout: 20000,
          failOnStatusCode: false,
        });
      }).then((loginResponse) => {
        expect(
          loginResponse.status,
          `POST ${apiBaseUrl}/api/auth/login doit reussir avec un vrai compte ${normalizedRole}. Reponse: ${JSON.stringify(loginResponse.body)}`,
        ).to.eq(200);

        const setCookieHeaders = loginResponse.headers["set-cookie"] || [];
        accessTokenCookie = setCookieHeaders
          .find((cookie) => cookie.startsWith("accessToken="))
          ?.split(";")[0]
          ?.replace("accessToken=", "");

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
        const user = response.body?.data;

        expect(user?.role, "role utilisateur").to.eq(normalizedRole);
        expect(accessTokenCookie, "accessToken cookie apres login").to.be.a("string").and.not.be.empty;

        return cy.visit("/", {
          onBeforeLoad(win) {
            win.document.cookie = `accessToken=${accessTokenCookie}; path=/; SameSite=Strict`;
            win.localStorage.setItem(
              "auth",
              JSON.stringify({
                user,
                isAuthenticated: true,
              }),
            );
          },
        });
      });
    },
    {
      cacheAcrossSpecs: true,
      validate() {
        cy.getCookie("accessToken").should("exist");
      },
    },
  );

  return cy.visit(path);
});

Cypress.Commands.add("loginAsAdminApi", (path = "/admin") => {
  cy.loginAsRoleApi("ADMINISTRATOR", path);
});

Cypress.Commands.add("loginAsAdminJwt", (path = "/admin") => {
  cy.loginAsRoleSession("ADMINISTRATOR", path);
});

Cypress.Commands.add("loginAsRoleJwt", (role, path = "/") => {
  const normalizedRole = String(role || "STUDENT").toUpperCase();

  if (normalizedRole === "ADMINISTRATOR") {
    cy.loginAsRoleSession(normalizedRole, path);
    return;
  }

  cy.loginAsRoleApi(normalizedRole, path);
});

Cypress.Commands.add("loginAsStudent", (path = "/student") => {
  cy.loginAsRoleApi("STUDENT", path);
});

Cypress.Commands.add("apiRequest", (methodOrOptions, url, body) => {
  const apiBaseUrl = Cypress.env("API_BASE_URL") || "http://localhost:3000";
  const options =
    typeof methodOrOptions === "object"
      ? { ...methodOrOptions }
      : { method: methodOrOptions, url, body };

  const method = String(options.method || "GET").toUpperCase();
  const requestOptions = {
    failOnStatusCode: false,
    ...options,
    method,
    url: options.url?.startsWith("http")
      ? options.url
      : `${apiBaseUrl}${options.url}`,
  };

  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    return cy.request(requestOptions);
  }

  return cy
    .request({
      method: "GET",
      url: `${apiBaseUrl}/api/auth/csrf-token`,
      failOnStatusCode: false,
    })
    .then((csrfResponse) => {
      expect(csrfResponse.status, "csrf token status").to.eq(200);
      expect(csrfResponse.body?.csrfToken, "csrf token").to.be.a("string").and.not.be.empty;

      return cy.request({
        ...requestOptions,
        headers: {
          ...(requestOptions.headers || {}),
          "x-csrf-token": csrfResponse.body.csrfToken,
        },
      });
    });
});
