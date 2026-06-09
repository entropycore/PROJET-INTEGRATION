import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import PortfolioGenerator from "@/views/student/portfolio/PortfolioPreviewView.vue";
import { getStudentPortfolioData } from "@/services/studentPortfolioService";

vi.mock("@/services/studentPortfolioService", () => ({
  getStudentPortfolioData: vi.fn(),
  generateStudentPortfolio: vi.fn(),
}));

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: vi.fn() }),
  RouterLink: { template: "<a><slot /></a>" },
}));

const mockData = {
  student: {
    fullName: "Ghizlane Rabii",
    major: "Informatique",
    school: "ENSA Tanger",
    professionalObjective: "Développeuse Web",
  },
  credibilityScore: { score: 85, label: "Très bon" },
  portfolio: { status: "ACTIVE" },
  portfolioConfig: {
    theme: "code-dark",
    includedSections: ["skills", "badges", "projects"],
    includedItems: {
      projects: [1],
      internships: [],
      activities: [],
      recommendationLetters: [],
      recommendations: [],
    },
  },
  projects: [{ id: 1, title: "Projet Vue", technologies: ["Vue"] }],
  internships: [],
  activities: [],
  recommendationLetters: [],
  recommendations: [],
};

describe("PortfolioGenerator - Tests UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getStudentPortfolioData.mockResolvedValue(mockData);
  });

  it("affiche les sections UI principales", async () => {
    const wrapper = mount(PortfolioGenerator);
    await vi.dynamicImportSettled();

    expect(wrapper.find(".page-header").exists()).toBe(true);
    expect(wrapper.find(".intro-card").exists()).toBe(true);
    expect(wrapper.find(".theme-section").exists()).toBe(true);
    expect(wrapper.find(".selection-summary").exists()).toBe(true);
  });

  it("affiche le thème actif avec la classe active", async () => {
    const wrapper = mount(PortfolioGenerator);
    await vi.dynamicImportSettled();

    const activeTheme = wrapper.find(".theme-card.active");

    expect(activeTheme.exists()).toBe(true);
    expect(activeTheme.text()).toContain("Code Dark");
    expect(activeTheme.find(".selected-badge").exists()).toBe(true);
  });

  it("affiche le bouton plein écran si le portfolio est généré", async () => {
    const wrapper = mount(PortfolioGenerator);
    await vi.dynamicImportSettled();

    expect(wrapper.text()).toContain("Voir en plein écran");
    expect(wrapper.find(".success-note").exists()).toBe(true);
  });

  it("vérifie les classes importantes liées au style", async () => {
    const wrapper = mount(PortfolioGenerator);
    await vi.dynamicImportSettled();

    expect(wrapper.find(".btn-primary").exists()).toBe(true);
    expect(wrapper.find(".btn-secondary").exists()).toBe(true);
    expect(wrapper.find(".score-box").exists()).toBe(true);
    expect(wrapper.find(".theme-card").classes()).toContain("theme-card");
  });
});
