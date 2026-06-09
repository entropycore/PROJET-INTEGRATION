import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import Settings from "@/views/Settings.vue";

vi.mock("../../services/api", () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      data: { data: { preferences: {} } },
    }),
  },
}));

describe("Settings Unit Test", () => {
  it("shows error when passwords do not match", async () => {
    const wrapper = mount(Settings);

    wrapper.vm.passwordForm = {
      currentPassword: "password123",
      newPassword: "newpassword123",
      confirmPassword: "differentpassword",
    };

    await wrapper.vm.savePassword();

    expect(wrapper.text()).toContain(
      "Les mots de passe ne correspondent pas.",
    );
  });
});