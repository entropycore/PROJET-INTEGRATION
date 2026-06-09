import { describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import ForgotPassword from "@/views/ForgotPasswordView.vue";
import { forgotPassword } from "@/services/authService";

vi.mock("vue-router", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/services/authService", () => ({ forgotPassword: vi.fn() }));

describe("ForgotPassword.vue - Tests UI (Interface)", () => {
  it("doit afficher correctement les elements initiaux de la page", () => {
    const wrapper = mount(ForgotPassword, {
      global: { stubs: { AppLogo: true } }
    });

    expect(wrapper.find("h2").text()).toContain("Mot de passe");
    expect(wrapper.find("button.submit-btn").text()).toBe("Envoyer le lien");
    expect(wrapper.find(".error-message").exists()).toBe(false);
    expect(wrapper.find(".success-message").exists()).toBe(false);
  });

  it("doit lier le champ e-mail avec la variable reactive (v-model)", async () => {
    const wrapper = mount(ForgotPassword, {
      global: { stubs: { AppLogo: true } }
    });
    const input = wrapper.find("input[type='email']");

    await input.setValue("test@ensa.ac.ma");

    expect(input.element.value).toBe("test@ensa.ac.ma");
  });

  it("doit desactiver le bouton et afficher 'Envoi...' pendant la soumission", async () => {
    let resolveRequest;
    forgotPassword.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      })
    );

    const wrapper = mount(ForgotPassword, {
      global: { stubs: { AppLogo: true } }
    });

    await wrapper.find("input[type='email']").setValue("user@ensa.ac.ma");
    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    const button = wrapper.find("button.submit-btn");
    expect(button.attributes("disabled")).toBeDefined();
    expect(button.text()).toBe("Envoi...");

    resolveRequest({ message: "Email envoye" });
    await flushPromises();
  });
});
