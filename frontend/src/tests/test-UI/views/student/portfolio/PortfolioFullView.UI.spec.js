import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import PortfolioFullView from "@/views/student/portfolio/PortfolioFullView.vue";
import {
  getStudentPortfolioData,
  getPublicPortfolioData,
} from "@/services/studentPortfolioService";

vi.mock("@/services/studentPortfolioService", () => ({
  getStudentPortfolioData: vi.fn(),
  getPublicPortfolioData: vi.fn(),
}));

vi.mock("@/services/api", () => ({
  default: { get: vi.fn() },
}));

vi.mock("@/components/student/portfolio/PortfolioHero.vue", {
  default: { template: "<div class='hero-section'></div>" },
});

vi.mock("@/components/student/portfolio/PortfolioSection.vue", {
  default: { template: "<section class='sec'><slot /></section>" },
});

const mockPush = vi.fn();

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({ params: { slug: "ghizlane-rabii" } }),
}));

describe("PortfolioFullView - Tests UI & Interactions", () => {
  let uiMockData;

  beforeEach(() => {
    vi.clearAllMocks();

    uiMockData = {
      student: { name: "Ghizlane", bio: "Engineering cycle student" },
      portfolioConfig: {
        theme: "pixel-tech",
        includedSections: ["skills", "softSkills", "projects"],
        includedItems: { projects: ["p1"] },
      },
      credibilityScore: { score: 90, level: "Excellent" },
      skills: [{ id: "1", name: "Vue.js" }],
      softSkills: [{ id: "2", name: "Autonomie" }],
      projects: [
        {
          id: "p1",
          title: "ValiDia QA Suite",
          description: "UI Verification testing framework setup",
          type: "Academic",
        },
      ],
    };

    getStudentPortfolioData.mockResolvedValue(uiMockData);
    getPublicPortfolioData.mockResolvedValue(uiMockData);
  });

  const createWrapper = async () => {
    const wrapper = mount(PortfolioFullView, {
      global: {
        stubs: {
          PortfolioHero: { template: "<div class='hero-section'></div>" },
          PortfolioSection: { template: "<section class='sec'><slot /></section>" },
        },
      },
    });

    await flushPromises();
    await wrapper.vm.$nextTick();

    return wrapper;
  };

  it("devrait correspondre a la structure du template HTML avec les bonnes classes CSS de theme dynamique", async () => {
    const wrapper = await createWrapper();

    expect(wrapper.find(".portfolio-full-page.theme-pixel-tech").exists()).toBe(
      true,
    );
  });

  it("devrait afficher dynamiquement les badges de competences sur les lignes de la mise en page", async () => {
    const wrapper = await createWrapper();

    expect(wrapper.text()).toContain("Vue.js");
    expect(wrapper.text()).toContain("Autonomie");
  });

  it("devrait derouler correctement le cycle d'ouverture de la boite modale de details lors du clic", async () => {
    const wrapper = await createWrapper();
    const detailsButton = wrapper
      .findAll("button")
      .find((button) => button.text().includes("Voir"));

    expect(detailsButton).toBeTruthy();

    await detailsButton.trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".details-modal").exists()).toBe(true);
    expect(wrapper.text()).toContain("ValiDia QA Suite");
  });
});
