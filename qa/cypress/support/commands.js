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

// Login command for admin user
Cypress.Commands.add("loginAsAdmin", (path = "/admin/badges") => {
  // Set authenticated user in localStorage
  const adminUser = {
    id: "1",
    email: "admin@example.com",
    firstName: "Admin",
    lastName: "User",
    role: "ADMINISTRATOR",
  };

  cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.setItem(
        "auth",
        JSON.stringify({
          user: adminUser,
          isAuthenticated: true,
        })
      );
    },
  });

  cy.attendreInterface();
});

Cypress.Commands.add("loginAsAdminApi", (path = "/admin") => {
  const apiBaseUrl = Cypress.env("API_BASE_URL") || "http://localhost:3000";
  const email = Cypress.env("ADMIN_EMAIL");
  const password = Cypress.env("ADMIN_PASSWORD");

  cy.clearCookies();
  cy.clearLocalStorage();

  return cy.request({
    method: "POST",
    url: `${apiBaseUrl}/api/auth/login`,
    body: { email, password },
    timeout: 20000,
    failOnStatusCode: false,
  }).then((loginResponse) => {
    expect(
      loginResponse.status,
      `POST ${apiBaseUrl}/api/auth/login doit reussir. Verifie que le backend est lance et que ADMIN_EMAIL/ADMIN_PASSWORD sont corrects. Reponse: ${JSON.stringify(loginResponse.body)}`,
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
      `GET ${apiBaseUrl}/api/auth/me doit retourner la session admin apres login. Reponse: ${JSON.stringify(response.body)}`,
    ).to.eq(200);
    expect(response.body?.data?.role, "role utilisateur").to.eq("ADMINISTRATOR");

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

Cypress.Commands.add("loginAsAdminJwt", (path = "/admin") => {
  cy.loginAsRoleJwt("ADMINISTRATOR", path);
});

Cypress.Commands.add("loginAsRoleJwt", (role, path = "/") => {
  const appBaseUrl = Cypress.config("baseUrl") || "http://localhost:5173";
  const normalizedRole = String(role || "STUDENT").toUpperCase();
  const user = {
    id: `cypress-${normalizedRole.toLowerCase()}-user`,
    email: `${normalizedRole.toLowerCase()}@credencia.test`,
    firstName: "Cypress",
    lastName: normalizedRole,
    role: normalizedRole,
  };

  cy.clearCookies();
  cy.clearLocalStorage();

  cy.task("signAccessToken", {
    userId: user.id,
    role: user.role,
    roleId: `cypress-${normalizedRole.toLowerCase()}-role`,
  }).then((token) => {
    cy.visit(`${appBaseUrl}/login`);

    cy.setCookie("accessToken", token, {
      path: "/",
      sameSite: "strict",
    });

    cy.getCookie("accessToken").should("exist");

    cy.visit(`${appBaseUrl}${path}`, {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          "auth",
          JSON.stringify({
            user,
            isAuthenticated: true,
          })
        );
      },
    });
  });
});

Cypress.Commands.add("loginAsStudent", (path = "/student") => {
  const studentUser = {
    id: "2",
    email: "student@example.com",
    firstName: "Student",
    lastName: "User",
    role: "STUDENT",
  };

  cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.setItem(
        "auth",
        JSON.stringify({
          user: studentUser,
          isAuthenticated: true,
        })
      );
    },
  });

  cy.attendreInterface();
});
