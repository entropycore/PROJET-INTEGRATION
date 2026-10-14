import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import PortfolioFullView from "@/views/student/portfolio/PortfolioFullView.vue";
import { getPublicPortfolioData, getStudentPortfolioData } from "@/services/studentPortfolioService";

// Mocking les dépendances complexes et les sous-composants
vi.mock("@/components/student/portfolio/PortfolioHero.vue", { default: { template: "<div id='hero-mock'></div>" } });
vi.mock("@/components/student/portfolio/PortfolioSection.vue", { default: { template: "<div><slot /></div>" } });

vi.mock("@/services/studentPortfolioService", () => ({
  getPublicPortfolioData: vi.fn(),
  getStudentPortfolioData: vi.fn(),
}));

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(() => Promise.resolve({ data: new Blob() })) }
}));

const mockPush = vi.fn();
let mockRouteParams = { slug: "" };

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({ params: mockRouteParams }),
}));

describe("PortfolioFullView - Unit Tests (Logic)", () => {
  let fakeData;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRouteParams.slug = "";
    fakeData = {
      student: { name: "Ghizlane", bio: "Engineering Student" },
      portfolioConfig: {
        theme: "minimal-recruiter",
        includedSections: ["skills"],
        includedItems: { projects: ["1"] }
      },
      skills: [{ id: "1", name: "Vue" }, { id: "2", name: "Vitest" }],
      projects: [{ id: "1", title: "ValiDia" }, { id: "2", title: "Ignored Project" }]
    };
    getStudentPortfolioData.mockResolvedValue(fakeData);
    getPublicPortfolioData.mockResolvedValue(fakeData);
  });

  it("should normalize themes from minimal-recruiter to code-dark", async () => {
    const wrapper = mount(PortfolioFullView);
    await vi.dynamicImportSettled();
    expect(wrapper.vm.selectedTheme).toBe("code-dark");
  });

  it("should filter listed projects strictly based on portfolioConfig", async () => {
    const wrapper = mount(PortfolioFullView);
    await vi.dynamicImportSettled();
    expect(wrapper.vm.portfolioData.projects).toHaveLength(1);
    expect(wrapper.vm.portfolioData.projects[0].id).toBe("1");
  });

  it("should format academic years correctly or fallback properly", () => {
    const wrapper = mount(PortfolioFullView);
    expect(wrapper.vm.formatAcademicYear("2026-06-06")).toContain("2026");
    expect(wrapper.vm.formatAcademicYear("bad-date")).toBe("bad-date");
  });
});