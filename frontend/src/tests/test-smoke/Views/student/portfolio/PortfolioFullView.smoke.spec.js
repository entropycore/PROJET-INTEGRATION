import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import PortfolioFullView from "@/views/student/portfolio/PortfolioFullView.vue";
import { getStudentPortfolioData } from "@/services/studentPortfolioService";

// Mock sous-composants
vi.mock("@/components/student/portfolio/PortfolioHero.vue", () => ({
  default: { template: "<div></div>" }
}));

vi.mock("@/components/student/portfolio/PortfolioSection.vue", () => ({
  default: { template: "<div><slot /></div>" }
}));

// Mock service API
vi.mock("@/services/studentPortfolioService", () => ({
  getStudentPortfolioData: vi.fn(),
  getPublicPortfolioData: vi.fn()
}));

// Mock router
vi.mock("vue-router", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ params: { slug: "" } }),
}));

// Mock clipboard
const mockWriteText = vi.fn().mockResolvedValue();

Object.defineProperty(global, "navigator", {
  value: {
    clipboard: {
      writeText: mockWriteText
    }
  },
  writable: true
});

describe("PortfolioFullView - Smoke Tests", () => {
  let spyAlert;

  beforeEach(() => {
    vi.clearAllMocks();
    spyAlert = vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  it("affiche le loading pendant le chargement", async () => {
    getStudentPortfolioData.mockReturnValue(new Promise(() => {}));

    const wrapper = mount(PortfolioFullView);
    await flushPromises();

    expect(wrapper.find(".loading-card").exists()).toBe(true);
    expect(wrapper.text()).toContain("Chargement du portfolio...");
  });

  it("affiche la structure principale après chargement des données", async () => {
    getStudentPortfolioData.mockResolvedValue({
      student: { name: "Ghizlane", bio: "Bio" },
      portfolioConfig: { theme: "modern-academic" },
      credibilityScore: { score: 10 } // ✅ FIX IMPORTANT
    });

    const wrapper = mount(PortfolioFullView);

    await flushPromises();

    expect(wrapper.find(".portfolio-full-page").exists()).toBe(true);
    expect(wrapper.find(".loading-card").exists()).toBe(false);
  });

  it("copie le lien et affiche une alerte", async () => {
    getStudentPortfolioData.mockResolvedValue({
      student: { name: "Ghizlane", bio: "Bio" },
      portfolioConfig: { theme: "modern-academic" },
      credibilityScore: { score: 10 } // ✅ FIX IMPORTANT
    });

    const wrapper = mount(PortfolioFullView);

    await flushPromises();

    const buttons = wrapper.findAll(".top-actions button");
    const copyBtn = buttons[0];

    await copyBtn.trigger("click");

    await flushPromises();

    expect(mockWriteText).toHaveBeenCalled();
    expect(spyAlert).toHaveBeenCalledWith("Lien copié.");
  });
});