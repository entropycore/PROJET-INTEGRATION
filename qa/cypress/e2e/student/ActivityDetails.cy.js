import { test, expect } from "@playwright/test";

const ACTIVITY_ID = process.env.E2E_ACTIVITY_ID || "1";

test.describe("E2E - Détails activité étudiant", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel(/email/i).fill(process.env.E2E_EMAIL);
    await page.getByLabel(/mot de passe|password/i).fill(process.env.E2E_PASSWORD);
    await page.getByRole("button", { name: /connexion|login/i }).click();

    await page.waitForURL(/student/);
  });

  test("affiche les détails de l’activité", async ({ page }) => {
    await page.goto(`/student/activities/${ACTIVITY_ID}`);

    await expect(page.getByText(/à propos de l’activité/i)).toBeVisible();
    await expect(page.getByText(/attestation/i)).toBeVisible();
    await expect(page.getByText(/captures \/ médias de l’activité/i)).toBeVisible();
    await expect(page.getByText(/historique de validation/i)).toBeVisible();
    await expect(page.getByText(/validation/i)).toBeVisible();
    await expect(page.getByText(/informations/i)).toBeVisible();
  });

  test("bouton retour redirige vers la liste des activités", async ({ page }) => {
    await page.goto(`/student/activities/${ACTIVITY_ID}`);

    await page.getByRole("button", { name: /retour aux activités/i }).click();

    await expect(page).toHaveURL(/\/student\/activities$/);
  });

  test("bouton modifier redirige vers la page edit si disponible", async ({ page }) => {
    await page.goto(`/student/activities/${ACTIVITY_ID}`);

    const editButton = page.getByRole("button", { name: /modifier/i });

    if (await editButton.isVisible()) {
      await editButton.click();
      await expect(page).toHaveURL(new RegExp(`/student/activities/${ACTIVITY_ID}/edit`));
    }
  });

  test("prévisualise l’attestation si elle existe", async ({ page }) => {
    await page.goto(`/student/activities/${ACTIVITY_ID}`);

    const previewButton = page.getByRole("button", { name: /prévisualiser/i });

    if (await previewButton.isVisible()) {
      await previewButton.click();

      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.getByText(/attestation/i)).toBeVisible();

      await page.getByLabel(/fermer/i).click();
      await expect(page.getByRole("dialog")).not.toBeVisible();
    }
  });

  test("téléchargement attestation existe si attestation disponible", async ({ page }) => {
    await page.goto(`/student/activities/${ACTIVITY_ID}`);

    const downloadLink = page.getByRole("link", { name: /télécharger/i });

    if (await downloadLink.isVisible()) {
      await expect(downloadLink).toHaveAttribute("href", /.+/);
    }
  });

  test("soumet l’activité si le bouton soumettre est disponible", async ({ page }) => {
    await page.goto(`/student/activities/${ACTIVITY_ID}`);

    const submitButton = page.getByRole("button", { name: /soumettre/i });

    if (await submitButton.isVisible()) {
      await submitButton.click();

      await expect(
        page.getByText(/activité soumise à validation|impossible de soumettre/i)
      ).toBeVisible();
    }
  });

  test("supprime l’activité si le bouton suppression est disponible", async ({ page }) => {
    await page.goto(`/student/activities/${ACTIVITY_ID}`);

    const deleteButton = page.getByRole("button", {
      name: /supprimer l’activité/i,
    });

    if (await deleteButton.isVisible()) {
      page.once("dialog", async (dialog) => {
        expect(dialog.message()).toContain("Voulez-vous vraiment supprimer");
        await dialog.accept();
      });

      await deleteButton.click();

      await expect(page).toHaveURL(/\/student\/activities$/);
    }
  });

  test("affiche erreur si activité introuvable", async ({ page }) => {
    await page.goto("/student/activities/999999999");

    await expect(
      page.getByText(/impossible de charger cette activité|activité introuvable/i)
    ).toBeVisible();
  });
});