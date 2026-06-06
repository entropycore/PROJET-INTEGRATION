import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import PortfolioFullView from "@/views/student/portfolio/PortfolioFullView.vue";
import { getStudentPortfolioData } from "@/services/studentPortfolioService";

// Mock complet du service
vi.mock("@/services/studentPortfolioService", () => ({
  getStudentPortfolioData: vi.fn(),
}));

// Mocks des sous-composants et du routeur
vi.mock("@/components/student/portfolio/PortfolioHero.vue", { default: { template: "<div class='hero-section'></div>" } });
vi.mock("@/components/student/portfolio/PortfolioSection.vue", { default: { template: "<section class='sec'><slot /></section>" } });
vi.mock("vue-router", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ params: { slug: "" } }),
}));

describe("PortfolioFullView - Tests UI & Interactions", () => {
  let uiMockData;

  beforeEach(() => {
    uiMockData = {
      student: { name: "Ghizlane", bio: "Engineering cycle student" },
      portfolioConfig: { theme: "creative-tech", includedSections: ["skills", "softSkills"] },
      skills: [{ id: "1", name: "Vue.js" }],
      softSkills: [{ id: "2", name: "Autonomie" }],
      projects: [
        { id: "p1", title: "ValiDia QA Suite", description: "UI Verification testing framework setup", type: "Academic" }
      ]
    };
    
    // Réinitialise le comportement du mock avant chaque test
    getStudentPortfolioData.mockReset();
    getStudentPortfolioData.mockResolvedValue(uiMockData);
  });

  it("devrait correspondre à la structure du template HTML avec les bonnes classes CSS de thème dynamique", async () => {
    const wrapper = mount(PortfolioFullView);
    await flushPromises();
    await wrapper.vm.$nextTick();

    const mainContainer = wrapper.find(".portfolio-full-page");
    expect(mainContainer.classes()).toContain("theme-pixel-tech");
  });

  it("devrait afficher dynamiquement les badges de compétences (chips) sur les lignes de la mise en page", async () => {
    const wrapper = mount(PortfolioFullView);
    
    // Double attente renforcée pour forcer le cycle de vie Vue à se terminer
    await flushPromises();
    await wrapper.vm.$nextTick();

    const chips = wrapper.findAll(".chips span");
    expect(chips).toHaveLength(2);
    expect(chips.at(0).text()).toBe("Vue.js");
    expect(chips.at(1).text()).toBe("Autonomie");
  });

  it("devrait dérouler correctement le cycle d'ouverture et de fermeture de la boîte modale de détails lors du clic", async () => {
    const wrapper = mount(PortfolioFullView);
    
    // Double attente renforcée pour s'assurer que les projets et boutons sont injectés dans le DOM
    await flushPromises();
    await wrapper.vm.$nextTick();

    // La structure de la modale ne doit pas exister initialement
    expect(wrapper.find(".modal-overlay").exists()).toBe(false);

    // Récupération sécurisée du bouton
    const detailsBtn = wrapper.find(".card-actions button");
    expect(detailsBtn.exists()).toBe(true); // Ajout d'une sécurité pour vérifier sa présence
    
    // Déclenchement du clic et attente immédiate de la mise à jour graphique du DOM
    await detailsBtn.trigger("click");
    await wrapper.vm.$nextTick();

    // La boîte modale doit maintenant être visible
    expect(wrapper.find(".modal-overlay").exists()).toBe(true);
    expect(wrapper.find(".details-modal h2").text()).toBe("ValiDia QA Suite");

    // Clic sur le bouton de fermeture à l'intérieur de la modale
    const closeBtn = wrapper.find(".close-btn");
    await closeBtn.trigger("click");
    await wrapper.vm.$nextTick();

    // La modale doit être refermée en toute sécurité
    expect(wrapper.find(".modal-overlay").exists()).toBe(false);
  });
});