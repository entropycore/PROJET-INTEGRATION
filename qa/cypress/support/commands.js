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
