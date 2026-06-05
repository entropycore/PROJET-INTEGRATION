describe("Gestion des utilisateurs - Admin", () => {
  const mockUsersResponse = {
    data: {
      items: [
        {
          id: "usr_student_1",
          firstName: "Safae",
          lastName: "Douae",
          email: "s.douae@ensa.ma",
          phone: "0611223344",
          role: "STUDENT",
          accountStatus: "ACTIVE",
          createdAt: "2026-01-10T09:00:00.000Z",
          lastLoginAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          roleDetails: { student: { major: "Genie Informatique", level: "CI1" } },
        },
        {
          id: "usr_recruiter_2",
          firstName: "Najim",
          lastName: "Recruiter",
          email: "najim@company.ma",
          phone: "0655667788",
          role: "PROFESSIONAL",
          accountStatus: "PENDING",
          createdAt: "2026-05-01T12:00:00.000Z",
          lastLoginAt: null,
          roleDetails: {
            professional: { company: "OCP Group", jobTitle: "QA Engineer Manager" },
          },
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      },
    },
  };

  beforeEach(() => {
    cy.intercept("GET", "**/api/admin/users*", mockUsersResponse).as("getUsers");
    cy.loginAsAdmin("/admin/users");
    cy.wait("@getUsers");
  });

  it("affiche les titres et colonnes de base", () => {
    cy.get("h1").should("contain", "Gestion des utilisateurs");
    cy.get(".users-table thead th").should("contain", "User");
    cy.get(".users-table thead th").should("contain", "Email");
    cy.get(".users-table thead th").should("contain", "Status");
    cy.get(".users-table tbody tr").should("have.length", 2);
    cy.get(".users-table").should("contain", "Safae Douae");
    cy.get(".users-table").should("contain", "Jamais");
  });

  it("gere la recherche avec debounce", () => {
    cy.intercept("GET", "**/api/admin/users*search=Safae*", {
      data: {
        items: [mockUsersResponse.data.items[0]],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      },
    }).as("searchUser");

    cy.get(".users-search input").type("Safae");
    cy.wait("@searchUser");
    cy.get(".users-table tbody tr").should("have.length", 1);
    cy.get(".users-table").should("contain", "Safae Douae");
    cy.get(".users-table").should("not.contain", "Najim Recruiter");
  });

  it("bascule les colonnes selon le role student", () => {
    cy.intercept("GET", "**/api/admin/users*role=STUDENT*", mockUsersResponse).as(
      "getStudentsOnly",
    );

    cy.loginAsAdmin("/admin/users?role=STUDENT");
    cy.wait("@getStudentsOnly");

    cy.get(".users-table thead th").should("contain", "Major");
    cy.get(".users-table thead th").should("contain", "Level");
    cy.get(".users-table tbody").should("contain", "Genie Informatique");
  });

  it("accepte un recruteur pending depuis le menu d'actions", () => {
    cy.intercept("PATCH", "**/api/admin/professional-requests/usr_recruiter_2/approve", {
      statusCode: 200,
    }).as("approveRecruiter");
    cy.intercept("GET", "**/api/admin/users*", mockUsersResponse).as("refreshUsers");

    cy.get(".users-table tbody tr").eq(1).find(".actions-trigger").click();
    cy.get(".actions-dropdown-menu").should("be.visible");
    cy.get(".actions-dropdown-menu button").contains("Accepter").click();

    cy.wait("@approveRecruiter");
    cy.wait("@refreshUsers");
  });

  it("importe un fichier CSV", () => {
    const mockCsvContent =
      "firstName,lastName,email,phone,role\nTest,User,test@ensa.ma,0611111111,STUDENT";

    cy.intercept("POST", "**/api/admin/users/import-csv", {
      statusCode: 200,
      body: { data: { createdCount: 1, failedCount: 0 } },
    }).as("importCsv");

    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from(mockCsvContent),
        fileName: "users_import.csv",
        mimeType: "text/csv",
      },
      { force: true },
    );

    cy.wait("@importCsv");
    cy.get(".users-import-result").should(
      "contain",
      "1 utilisateur(s) importe(s), 0 erreur(s).",
    );
  });

  it("redirige vers la creation d'un nouvel utilisateur", () => {
    cy.get(".primary-action").contains("+ New User").click();
    cy.url().should("include", "/admin/users/create");
  });
});
