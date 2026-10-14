import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import ResetPassword from "@/views/ResetPasswordView.vue";
import { resetPassword } from "@/services/authService";

const { mockPush, routeState } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  routeState: { query: { token: "initial-token" } }
}));

vi.mock("vue-router", () => ({
  useRoute: () => routeState,
  useRouter: () => ({ push: mockPush })
}));

vi.mock("@/services/authService", () => ({
  resetPassword: vi.fn()
}));

describe("ResetPassword.vue - Tests Unitaires (Logique)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    routeState.query = { token: "valid-token-xyz" };
  });

  it("doit afficher une erreur et bloquer le formulaire si le token est manquant dans l'URL", async () => {
    routeState.query = {};

    const wrapper = mount(ResetPassword, {
      global: { stubs: { AppLogo: true } }
    });
    await wrapper.vm.$nextTick();

    const errorText = wrapper.find(".error-message");
    expect(errorText.exists()).toBe(true);
    expect(errorText.text()).toContain("manquant ou invalide");

    expect(wrapper.find("#newPassword").element.disabled).toBe(true);
    expect(wrapper.find("button.submit-btn").element.disabled).toBe(true);
  });

  it("doit afficher une erreur si les deux mots de passe ne correspondent pas", async () => {
    const wrapper = mount(ResetPassword, {
      global: { stubs: { AppLogo: true } }
    });
    await wrapper.vm.$nextTick();

    await wrapper.find("#newPassword").setValue("Password123");
    await wrapper.find("#confirmPassword").setValue("Different123");
    await wrapper.find("form").trigger("submit.prevent");

    const errorText = wrapper.find(".error-message");
    expect(errorText.exists()).toBe(true);
    expect(errorText.text()).toContain("Les mots de passe ne correspondent pas.");
    expect(resetPassword).not.toHaveBeenCalled();
  });

  it("doit appeler l'API et rediriger vers la connexion avec un parametre de requete en cas de succes", async () => {
    resetPassword.mockResolvedValue({ message: "Succes !" });

    const wrapper = mount(ResetPassword, {
      global: { stubs: { AppLogo: true } }
    });
    await wrapper.vm.$nextTick();

    await wrapper.find("#newPassword").setValue("ValidPass123");
    await wrapper.find("#confirmPassword").setValue("ValidPass123");
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

    expect(resetPassword).toHaveBeenCalledWith({
      token: "valid-token-xyz",
      newPassword: "ValidPass123"
    });

    expect(mockPush).toHaveBeenCalledWith({
      path: "/login",
      query: { reset: "success" }
    });
  });

  it("doit recuperer et afficher l'erreur retournee par l'API en cas d'echec de la reinitialisation", async () => {
    resetPassword.mockRejectedValue({
      response: {
        data: { message: "Ce lien a expire." }
      }
    });

    const wrapper = mount(ResetPassword, {
      global: { stubs: { AppLogo: true } }
    });
    await wrapper.vm.$nextTick();

    await wrapper.find("#newPassword").setValue("ValidPass123");
    await wrapper.find("#confirmPassword").setValue("ValidPass123");
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

    const errorText = wrapper.find(".error-message");
    expect(errorText.exists()).toBe(true);
    expect(errorText.text()).toContain("Ce lien a expire.");
  });
});
