import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { getStudentBadges } from "@/services/studentDashboardService";

import MesBadges from "@/views/student/Badges.vue";

vi.mock("@/services/studentDashboardService", () => ({
  getStudentBadges: vi.fn(),
}));

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

const badgesResponse = {
  data: {
    data: [
      {
        id: 1,
        name: "Web Developer",
        description: "Badge web",
        rule: "3 projets web validés",
        isObtained: true,
        obtainedAt: "Mars 2025",
        progress: { current: 3, target: 3 },
      },
    ],
  },
};

const mountLoadedBadges = async () => {
  const wrapper = mount(MesBadges);
  await flushPromises();
  await wrapper.vm.$nextTick();
  return wrapper;
};

describe("MesBadges UI Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getStudentBadges).mockResolvedValue(badgesResponse);
  });

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

  it("has badges grid container", async () => {
    const wrapper = await mountLoadedBadges();

    expect(
      wrapper.find(".badges-grid").exists()
    ).toBe(true);
  });
});
