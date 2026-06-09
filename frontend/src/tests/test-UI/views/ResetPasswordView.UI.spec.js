import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import ResetPassword from "@/views/ResetPasswordView.vue";
import { resetPassword } from "@/services/authService";

const mockPush = vi.fn();

vi.mock("vue-router", () => ({
  useRoute: () => ({ query: { token: "valid-token-123" } }),
  useRouter: () => ({ push: mockPush })
}));

vi.mock("@/services/authService", () => ({
  resetPassword: vi.fn(() => Promise.resolve({ message: "SuccÃ¨s" }))
}));

describe("ResetPassword.vue - Tests UI (Interface)", () => {
  const globalOptions = {
    stubs: {
      AppLogo: true
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    resetPassword.mockResolvedValue({ message: "SuccÃ¨s" });
  });

  it("doit afficher les elements initiaux de la page lorsque le token est valide", async () => {
    const wrapper = mount(ResetPassword, { global: globalOptions });
    await wrapper.vm.$nextTick();

    expect(wrapper.find("h2").text()).toContain("mot de passe");
    expect(wrapper.find("#newPassword").element.disabled).toBe(false);
    expect(wrapper.find("#confirmPassword").element.disabled).toBe(false);
    expect(wrapper.find("button.submit-btn").element.disabled).toBe(false);
  });

  it("doit lier les inputs de mots de passe aux variables reactives (v-model)", async () => {
    const wrapper = mount(ResetPassword, { global: globalOptions });
    await wrapper.vm.$nextTick();

    const inputPass = wrapper.find("#newPassword");
    const inputConfirm = wrapper.find("#confirmPassword");

    await inputPass.setValue("EnsaTanger2026");
    await inputConfirm.setValue("EnsaTanger2026");

    expect(inputPass.element.value).toBe("EnsaTanger2026");
    expect(inputConfirm.element.value).toBe("EnsaTanger2026");
  });

  it("doit basculer le type de l'input entre 'password' et 'text' lors du clic sur l'icone de visibilite", async () => {
    const wrapper = mount(ResetPassword, { global: globalOptions });
    await wrapper.vm.$nextTick();

    const inputPass = wrapper.find("#newPassword");
    const toggleIcon = wrapper.find(".form-group:first-of-type .toggle-icon");

    expect(inputPass.attributes("type")).toBe("password");

    await toggleIcon.trigger("click");
    expect(inputPass.attributes("type")).toBe("text");

    await toggleIcon.trigger("click");
    expect(inputPass.attributes("type")).toBe("password");
  });

  it("doit afficher l'etat de chargement sur le bouton lors de la soumission", async () => {
    let resolveRequest;
    resetPassword.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      })
    );

    const wrapper = mount(ResetPassword, { global: globalOptions });
    await wrapper.vm.$nextTick();

    await wrapper.find("#newPassword").setValue("Password123!");
    await wrapper.find("#confirmPassword").setValue("Password123!");
    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    const button = wrapper.find("button.submit-btn");
    expect(button.text()).toBe("Validation...");
    expect(button.attributes("disabled")).toBeDefined();

    resolveRequest({ message: "SuccÃ¨s" });
    await flushPromises();
  });
});
