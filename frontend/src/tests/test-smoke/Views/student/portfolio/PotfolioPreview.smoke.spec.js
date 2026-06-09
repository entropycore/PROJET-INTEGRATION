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
    professionalObjective: { label: "Développeuse Web", value: "WEB_DEVELOPER" },
  },
  credibilityScore: { score: 85, label: "Très bon" },
  portfolio: null,
  portfolioConfig: null,
  projects: [{ id: 1, title: "Projet Vue", technologies: ["Vue", "Laravel"] }],
  internships: [{ id: 2, title: "Stage Dev", company: "ABC", period: "2025", duration: "2 mois" }],
  activities: [{ id: 3, title: "Hackathon", type: "Compétition", date: "2025" }],
  recommendationLetters: [{ id: 4, title: "Lettre prof", author: "Prof A", type: "Académique" }],
  recommendations: [{ id: 5, author: "Manager", authorJobTitle: "CTO", organization: "XYZ", content: "Très sérieuse" }],
};

describe("PortfolioGenerator - Smoke", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getStudentPortfolioData.mockResolvedValue(mockData);
  });

  it("monte la page sans erreur et affiche les données principales", async () => {
    const wrapper = mount(PortfolioGenerator);

    await vi.dynamicImportSettled();

    expect(wrapper.text()).toContain("Génération du portfolio");
    expect(wrapper.text()).toContain("Ghizlane Rabii");
    expect(wrapper.text()).toContain("85/100");
    expect(wrapper.text()).toContain("Projet Vue");
  });
});
