import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestingPinia } from "@pinia/testing";
import LoginPage from "@/views/LoginView.vue";

const { mockRouter, mockRoute, loginMock, getMeMock } = vi.hoisted(() => ({
  mockRouter: { push: vi.fn() },
  mockRoute: { path: "/login", name: "login", params: {}, query: {} },
  loginMock: vi.fn(),
  getMeMock: vi.fn(),
}));

vi.mock("vue-router", async () => {
  const actual = await vi.importActual("vue-router");
  return { ...actual, useRouter: () => mockRouter, useRoute: () => mockRoute };
});

vi.mock("@/services/authService", () => ({
  login: loginMock,
  getMe: getMeMock,
}));

const flushPromises = async () => {
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
};

describe("LoginPage.vue - Tests unitaires de la page de connexion", () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRoute.query = {};
    loginMock.mockResolvedValue({});
    getMeMock.mockResolvedValue({
      data: { data: { id: 1, email: "test@ensa.ac.ma" } },
    });

    wrapper = mount(LoginPage, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs: { AppLogo: true },
      },
    });
  });

  it("doit afficher une erreur si les champs e-mail ou mot de passe sont vides", async () => {
    await wrapper.find("form").trigger("submit.prevent");
    const error = wrapper.find(".error-message");
    expect(error.exists()).toBe(true);
    expect(error.text()).toBe("Veuillez remplir tous les champs.");
  });

  it("doit changer le type de l'input mot de passe lors du clic sur l'icône", async () => {
    const passwordInput = wrapper.find("#password");
    const toggleIcon = wrapper.find(".toggle-icon");
    expect(passwordInput.attributes("type")).toBe("password");
    await toggleIcon.trigger("click");
    expect(passwordInput.attributes("type")).toBe("text");
  });

  it('doit désactiver le bouton et afficher "Connexion..." pendant le chargement', async () => {
    let resolveLogin;
    loginMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLogin = resolve;
        }),
    );

    await wrapper.find("#email").setValue("test@ensa.ac.ma");
    await wrapper.find("#password").setValue("password123");
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

    const submitBtn = wrapper.find(".submit-btn");
    expect(submitBtn.text()).toContain("Connexion...");
    expect(submitBtn.attributes()).toHaveProperty("disabled");

    resolveLogin({});
    await flushPromises();
  });

  it("doit rediriger l'utilisateur vers la page de demande d'accès", async () => {
    const link = wrapper.find(".access-request-link");
    await link.trigger("click");
    await flushPromises();
    expect(mockRouter.push).toHaveBeenCalledWith("/request-access");
  });

  it("doit afficher un message de succès après une connexion réussie", async () => {
    await wrapper.find("#email").setValue("test@ensa.ac.ma");
    await wrapper.find("#password").setValue("password123");
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

    const successBox = wrapper.find(".success-message");
    expect(successBox.exists()).toBe(true);
    expect(successBox.text()).toBe("Connexion réussie.");
  });

  it("doit afficher une erreur si la connexion échoue", async () => {
    loginMock.mockRejectedValueOnce({
      response: {
        data: {
          message: "Identifiants invalides",
        },
      },
    });

    await wrapper.find("#email").setValue("test@ensa.ac.ma");
    await wrapper.find("#password").setValue("wrong-password");
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

    expect(getMeMock).not.toHaveBeenCalled();
    expect(wrapper.find(".error-message").text()).toBe("Identifiants invalides");
  });

  it("doit afficher une erreur si le profil utilisateur ne se charge pas", async () => {
    getMeMock.mockRejectedValueOnce(new Error("Profile failed"));

    await wrapper.find("#email").setValue("test@ensa.ac.ma");
    await wrapper.find("#password").setValue("password123");
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

    expect(loginMock).toHaveBeenCalled();
    expect(getMeMock).toHaveBeenCalled();
    expect(wrapper.find(".error-message").text()).toBe(
      "Connexion impossible. Vérifiez vos identifiants."
    );
  });

  it("doit rediriger selon le rôle utilisateur", async () => {
    getMeMock.mockResolvedValueOnce({
      data: {
        data: {
          id: 2,
          email: "student@ensa.ac.ma",
          role: "STUDENT",
        },
      },
    });

    await wrapper.find("#email").setValue("student@ensa.ac.ma");
    await wrapper.find("#password").setValue("password123");
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

    expect(mockRouter.push).toHaveBeenCalledWith("/student");
  });
});
