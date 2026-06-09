import {
  describe,
  it,
  expect,
  vi,
} from "vitest";

import { mount } from "@vue/test-utils";

import Dashboard from "@/views/student/Dashboard.vue";

vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock(
  "@/services/studentDashboardService",
  () => ({
    getStudentDashboardData: vi.fn(),
  })
);

describe("Dashboard UI Tests", () => {
  it("renders component", () => {
    const wrapper = mount(Dashboard);

    expect(
      wrapper.exists()
    ).toBe(true);
  });

  it("contains dashboard header", () => {
    const wrapper = mount(Dashboard);

    expect(
      wrapper.find(
        ".dashboard-header"
      ).exists()
    ).toBe(true);
  });

  it("contains statistics section", () => {
    const wrapper = mount(Dashboard);

    expect(
      wrapper.find(
        ".stats-grid"
      ).exists()
    ).toBe(true);
  });

  it("contains projects section", () => {
    const wrapper = mount(Dashboard);

    expect(
      wrapper.text()
    ).toContain(
      "Projets récents"
    );
  });

  it("contains badges section", () => {
    const wrapper = mount(Dashboard);

    expect(
      wrapper.text()
    ).toContain(
      "Badges obtenus"
    );
  });

  it("contains credibility section", () => {
    const wrapper = mount(Dashboard);

    expect(
      wrapper.text()
    ).toContain(
      "Score de crédibilité"
    );
  });

  it("contains notifications section", () => {
    const wrapper = mount(Dashboard);

    expect(
      wrapper.text()
    ).toContain(
      "Notifications récentes"
    );
  });

  it("shows loading message", async () => {
    const wrapper = mount(Dashboard);

    wrapper.vm.isLoading = true;

    await wrapper.vm.$nextTick();

    expect(
      wrapper.text()
    ).toContain(
      "Chargement du dashboard"
    );
  });
});