import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import ForgotPassword from "@/views/ForgotPasswordView.vue";
import { forgotPassword } from "@/services/authService";

// Mocks complets pour espionner les appels de fonctions
const mockPush = vi.fn();
vi.mock("vue-router", () => ({
  useRouter: () => ({ push: mockPush })
}));

vi.mock("@/services/authService", () => ({
  forgotPassword: vi.fn()
}));

describe("ForgotPassword.vue - Tests Unitaires (Logique)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("doit rediriger vers la page de connexion lors du clic sur 'Retour à la connexion'", async () => {
    const wrapper = mount(ForgotPassword, {
      global: { stubs: { AppLogo: true } }
    });

    await wrapper.find(".login-link span").trigger("click");

    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("doit bloquer la soumission et afficher un message d'erreur si l'e-mail est vide", async () => {
    const wrapper = mount(ForgotPassword, {
      global: { stubs: { AppLogo: true } }
    });

    await wrapper.find("form").trigger("submit.prevent");

    const errorText = wrapper.find(".error-message");
    expect(errorText.exists()).toBe(true);
    expect(errorText.text()).toContain("Veuillez renseigner votre adresse email.");
    expect(forgotPassword).not.toHaveBeenCalled();
  });

  it("doit afficher un message de succès suite à une réponse API positive", async () => {
    forgotPassword.mockResolvedValue({ message: "Lien envoyé !" });

    const wrapper = mount(ForgotPassword, {
      global: { stubs: { AppLogo: true } }
    });

    await wrapper.find("input[type='email']").setValue("etudiant@ensa.ac.ma");
    await wrapper.find("form").trigger("submit.prevent");

    expect(forgotPassword).toHaveBeenCalledWith("etudiant@ensa.ac.ma");
    
    await wrapper.vm.$nextTick(); 

    const successText = wrapper.find(".success-message");
    expect(successText.exists()).toBe(true);
    expect(successText.text()).toContain("Lien envoyé !");
  });

  it("doit traiter et afficher l'erreur renvoyée par le serveur en cas d'échec", async () => {
    const apiError = {
      response: {
        data: { errors: [{ message: "Adresse introuvable." }] }
      }
    };
    forgotPassword.mockRejectedValue(apiError);

    const wrapper = mount(ForgotPassword, {
      global: { stubs: { AppLogo: true } }
    });

    await wrapper.find("input[type='email']").setValue("wrong@ensa.ac.ma");
    await wrapper.find("form").trigger("submit.prevent");

    await new Promise(process.nextTick);
    await wrapper.vm.$nextTick();

    const errorText = wrapper.find(".error-message");
    expect(errorText.exists()).toBe(true);
    expect(errorText.text()).toContain("Adresse introuvable.");
  });
});
