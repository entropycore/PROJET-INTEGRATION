import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import PortfolioGenerator from "@/views/student/portfolio/PortfolioPreviewView.vue";
import {
  getStudentPortfolioData,
  generateStudentPortfolio,
} from "@/services/studentPortfolioService";

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
    professionalObjective: { label: "Développeuse Web", value: "WEB_DEVELOPER" },
  },
  credibilityScore: { score: 90, label: "Excellent" },
  portfolio: null,
  portfolioConfig: null,
  projects: [{ id: 1, title: "Projet Vue", technologies: ["Vue"] }],
  internships: [{ id: 2, title: "Stage Dev", company: "ABC", period: "2025", duration: "2 mois" }],
  activities: [{ id: 3, title: "Hackathon", type: "Compétition", date: "2025" }],
  recommendationLetters: [{ id: 4, title: "Lettre prof", author: { name: "Prof A" }, type: "Académique" }],
  recommendations: [{ id: 5, author: { fullName: "Manager B" }, authorJobTitle: "CTO", organization: "XYZ", content: "Très sérieuse" }],
};

const mountComponent = async () => {
  getStudentPortfolioData.mockResolvedValue(mockData);
  const wrapper = mount(PortfolioGenerator);
  await vi.dynamicImportSettled();
  return wrapper;
};

describe("PortfolioGenerator - Tests unitaires", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sélectionne tous les éléments par défaut si aucun portfolio sauvegardé", async () => {
    const wrapper = await mountComponent();

    expect(wrapper.text()).toContain("5");
    expect(wrapper.text()).toContain("éléments sélectionnés");
  });

  it("désélectionne un projet après clic", async () => {
    const wrapper = await mountComponent();

    await wrapper.find(".selectable-item").trigger("click");

    expect(wrapper.text()).toContain("4");
  });

  it("change le thème quand on clique sur une carte thème", async () => {
    const wrapper = await mountComponent();

    const themeCards = wrapper.findAll(".theme-card");
    await themeCards[1].trigger("click");

    expect(themeCards[1].classes()).toContain("active");
    expect(wrapper.text()).toContain("Sélectionné");
  });

  it("appelle generateStudentPortfolio avec le payload correct", async () => {
    generateStudentPortfolio.mockResolvedValue({
      data: {
        data: {
          ...mockData,
          portfolio: { status: "ACTIVE" },
        },
      },
    });

    const wrapper = await mountComponent();

    await wrapper.find(".btn-primary").trigger("click");

    expect(generateStudentPortfolio).toHaveBeenCalledWith(
      expect.objectContaining({
        goal: "WEB_DEVELOPER",
        theme: "modern-academic",
        includedSections: expect.arrayContaining([
          "skills",
          "softSkills",
          "badges",
          "academicPaths",
          "githubActivity",
          "projects",
        ]),
        includedItems: expect.objectContaining({
          projects: [1],
          internships: [2],
          activities: [3],
        }),
      })
    );

    expect(wrapper.text()).toContain("Votre portfolio a été généré avec succès");
  });
});
