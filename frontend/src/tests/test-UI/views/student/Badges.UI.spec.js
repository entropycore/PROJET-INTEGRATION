import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";

import MesBadges from "@/views/student/MesBadges.vue";

vi.mock("@/services/studentDashboardService", () => ({
  getStudentBadges: vi.fn(),
}));

describe("MesBadges UI Tests", () => {
  it("displays page title", () => {
    const wrapper = mount(MesBadges);

    expect(wrapper.text()).toContain(
      "Mes badges"
    );
  });

  it("displays filters section", () => {
    const wrapper = mount(MesBadges);

    expect(
      wrapper.find(".filters").exists()
    ).toBe(true);
  });

  it("displays page header", () => {
    const wrapper = mount(MesBadges);

    expect(
      wrapper.find(".page-header").exists()
    ).toBe(true);
  });

  it("displays badges summary", () => {
    const wrapper = mount(MesBadges);

    expect(
      wrapper.find(".obtained-summary").exists()
    ).toBe(true);
  });

  it("contains filter buttons", () => {
    const wrapper = mount(MesBadges);

    expect(wrapper.text()).toContain("Tous");
    expect(wrapper.text()).toContain("En cours");
    expect(wrapper.text()).toContain("Obtenus");
  });

  it("shows loading state", async () => {
    const wrapper = mount(MesBadges);

    wrapper.vm.isLoading = true;

    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain(
      "Chargement des badges"
    );
  });

  it("has badges grid container", () => {
    const wrapper = mount(MesBadges);

    expect(
      wrapper.find(".badges-grid").exists()
    ).toBe(true);
  });
});