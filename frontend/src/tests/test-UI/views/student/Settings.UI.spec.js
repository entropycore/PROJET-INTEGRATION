import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import Settings from "@/views/student/Settings.vue";

vi.mock("@/services/api", () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      data: { data: { preferences: {} } },
    }),
  },
}));

vi.mock("@/services/settingsService", () => ({
  updatePassword: vi.fn(),
  updatePrivacy: vi.fn(),
  updateNotifications: vi.fn(),
}));

describe("Settings UI Test", () => {
  it("displays all main sections", async () => {
    const wrapper = mount(Settings);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain("Changer le mot de passe");
    expect(wrapper.text()).toContain("Confidentialité");
    expect(wrapper.text()).toContain("Notifications");
  });
});
