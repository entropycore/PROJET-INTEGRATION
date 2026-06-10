import {
  describe,
  it,
  expect,
  vi,
} from "vitest";

import { mount } from "@vue/test-utils";
import { getStudentDashboardData } from "@/services/studentDashboardService";

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

const dashboardData = {
  user: { firstName: "Sara" },
  stats: {
    validatedProjects: 2,
    credibilityScore: 80,
    badgesCount: 1,
    recommendationsCount: 3,
    pendingRecommendations: 0,
  },
  credibility: { score: 80, label: "Fort", details: [] },
  recentProjects: [],
  badges: [],
  notifications: [],
};

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

const mountLoadedDashboard = async () => {
  const wrapper = mount(Dashboard);
  await flushPromises();
  await wrapper.vm.$nextTick();
  return wrapper;
};

describe("Dashboard UI Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getStudentDashboardData).mockResolvedValue(dashboardData);
  });

  it("renders component", () => {
    const wrapper = mount(Dashboard);

    expect(
      wrapper.exists()
    ).toBe(true);
  });

  it("contains dashboard header", async () => {
    const wrapper = await mountLoadedDashboard();

    expect(
      wrapper.find(
        ".dashboard-header"
      ).exists()
    ).toBe(true);
  });

  it("contains statistics section", async () => {
    const wrapper = await mountLoadedDashboard();

    expect(
      wrapper.find(
        ".stats-grid"
      ).exists()
    ).toBe(true);
  });

  it("contains projects section", async () => {
    const wrapper = await mountLoadedDashboard();

    expect(
      wrapper.text()
    ).toContain(
      "Projets récents"
    );
  });

  it("contains badges section", async () => {
    const wrapper = await mountLoadedDashboard();

    expect(
      wrapper.text()
    ).toContain(
      "Badges obtenus"
    );
  });

  it("contains credibility section", async () => {
    const wrapper = await mountLoadedDashboard();

    expect(
      wrapper.text()
    ).toContain(
      "Score de crédibilité"
    );
  });

  it("contains notifications section", async () => {
    const wrapper = await mountLoadedDashboard();

    expect(
      wrapper.text()
    ).toContain(
      "Notifications récentes"
    );
  });

  it("shows loading message", async () => {
    vi.mocked(getStudentDashboardData).mockReturnValue(new Promise(() => {}));
    const wrapper = mount(Dashboard);

    expect(
      wrapper.text()
    ).toContain(
      "Chargement du dashboard"
    );
  });
});
