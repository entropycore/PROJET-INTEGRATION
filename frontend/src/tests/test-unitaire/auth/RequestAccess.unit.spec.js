import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestingPinia } from "@pinia/testing";
import RequestAccessPage from "@/views/RequestAccessView.vue";

const { requestAccessMock } = vi.hoisted(() => ({
  requestAccessMock: vi.fn(),
}));

vi.mock("@/services/requestAccessService", () => ({
  requestAccess: requestAccessMock,
}));

const flushPromises = async () => {
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
};

const fillValidForm = async (wrapper) => {
  await wrapper.find("#lastName").setValue("Berrada");
  await wrapper.find("#firstName").setValue("Amina");
  await wrapper.find("#email").setValue("amina@email.ma");
  await wrapper.find("#companyName").setValue("Ma Société");
  await wrapper.find("#jobTitle").setValue("Développeur");
  await wrapper.find("#password").setValue("Password123");
  await wrapper.find("#passwordConfirmation").setValue("Password123");
};

describe("Tests Unitaires - Page Demande d'accès", () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    requestAccessMock.mockResolvedValue({ message: "Demande envoyée." });

    wrapper = mount(RequestAccessPage, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs: { AppLogo: true },
      },
    });
  });

  it("doit afficher une erreur si un champ obligatoire est vide", async () => {
    await wrapper.find("form").trigger("submit.prevent");
    const error = wrapper.find(".error-message");
    expect(error.exists()).toBe(true);
    expect(error.text()).toBe("Veuillez remplir tous les champs.");
  });

  it("doit valider que les mots de passe ne correspondent pas", async () => {
    await wrapper.find("#lastName").setValue("Berrada");
    await wrapper.find("#firstName").setValue("Amina");
    await wrapper.find("#email").setValue("amina@email.ma");
    await wrapper.find("#companyName").setValue("Ma Société");
    await wrapper.find("#jobTitle").setValue("Développeur");
    await wrapper.find("#password").setValue("Password123");
    await wrapper.find("#passwordConfirmation").setValue("Diff123");
    await wrapper.find("form").trigger("submit.prevent");

    const error = wrapper.find(".error-message");
    expect(error.text()).toBe("Les mots de passe ne correspondent pas.");
  });

  it("doit afficher un message de succès après une soumission valide", async () => {
    await fillValidForm(wrapper);
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

    const success = wrapper.find(".success-message");
    expect(success.exists()).toBe(true);
    expect(success.text()).toContain("Demande envoyée.");
  });

  it("doit afficher une erreur si l'API refuse la demande", async () => {
    requestAccessMock.mockRejectedValueOnce({
      response: {
        data: {
          message: "Email déjà utilisé.",
        },
      },
    });

    await fillValidForm(wrapper);
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

    const error = wrapper.find(".error-message");
    expect(requestAccessMock).toHaveBeenCalled();
    expect(error.exists()).toBe(true);
    expect(error.text()).toBe("Email déjà utilisé.");
  });

  it("doit afficher la première erreur de validation retournée par l'API", async () => {
    requestAccessMock.mockRejectedValueOnce({
      response: {
        data: {
          message: "Données invalides.",
          errors: [{ message: "Le mot de passe est trop court." }],
        },
      },
    });

    await fillValidForm(wrapper);
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

    expect(wrapper.find(".error-message").text()).toBe(
      "Le mot de passe est trop court."
    );
  });

  it("doit désactiver le bouton pendant l'envoi", async () => {
    let resolveRequest;
    requestAccessMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        })
    );

    await fillValidForm(wrapper);
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

    const submitButton = wrapper.find(".submit-btn");
    expect(submitButton.attributes()).toHaveProperty("disabled");
    expect(submitButton.text()).toContain("Envoi...");

    resolveRequest({ message: "Demande envoyée." });
    await flushPromises();
  });
});
