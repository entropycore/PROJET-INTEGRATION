import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import PortfolioSection from "@/components/student/portfolio/PortfolioSection.vue";

const mountUI = (props = {}, slots = {}) =>
  mount(PortfolioSection, {
    props: { title: "Mes Projets", ...props },
    slots,
    attachTo: document.body,
  });

describe("PortfolioSection — Tests UI", () => {


  describe("Visibilité des éléments", () => {
    it("le titre est visible dans le DOM", () => {
      const wrapper = mountUI({ title: "Expériences Pro" });
      expect(wrapper.find("h2").isVisible()).toBe(true);
    });

    it("l'icône Material est visible", () => {
      const wrapper = mountUI({ icon: "work" });
      expect(wrapper.find(".material-icons-round").isVisible()).toBe(true);
    });

    it("le contenu du slot est visible", () => {
      const wrapper = mountUI(
        {},
        { default: "<p class='visible-slot'>Contenu visible</p>" }
      );
      expect(wrapper.find(".visible-slot").isVisible()).toBe(true);
    });
  });

  describe("Classes CSS — thème", () => {
    it("la section porte à la fois '.portfolio-section' et la classe theme", () => {
      const wrapper = mountUI({ theme: "modern-academic" });
      const section = wrapper.find(".portfolio-section");
      expect(section.classes()).toContain("portfolio-section");
      expect(section.classes()).toContain("theme-modern-academic");
    });

    it("le changement de theme met à jour la classe CSS", async () => {
      const wrapper = mountUI({ theme: "light" });
      expect(wrapper.find(".portfolio-section").classes()).toContain(
        "theme-light"
      );
      await wrapper.setProps({ theme: "dark" });
      expect(wrapper.find(".portfolio-section").classes()).toContain(
        "theme-dark"
      );
      expect(wrapper.find(".portfolio-section").classes()).not.toContain(
        "theme-light"
      );
    });
  });


  describe("Réactivité — mise à jour des props", () => {
    it("le titre se met à jour dans le DOM après setProps", async () => {
      const wrapper = mountUI({ title: "Avant" });
      expect(wrapper.find("h2").text()).toContain("Avant");
      await wrapper.setProps({ title: "Après" });
      expect(wrapper.find("h2").text()).toContain("Après");
    });

    it("l'icône se met à jour dans le DOM après setProps", async () => {
      const wrapper = mountUI({ icon: "home" });
      expect(wrapper.find(".material-icons-round").text()).toBe("home");
      await wrapper.setProps({ icon: "star" });
      expect(wrapper.find(".material-icons-round").text()).toBe("star");
    });
  });

  // ─── Accessibilité de base ────────────────────────────────────────────────

  describe("Accessibilité", () => {
    it("utilise une balise sémantique <section>", () => {
      const wrapper = mountUI();
      expect(wrapper.element.tagName.toLowerCase()).toBe("section");
    });

    it("utilise un <h2> pour le titre (hiérarchie heading)", () => {
      const wrapper = mountUI();
      expect(wrapper.find("h2").exists()).toBe(true);
    });

    it("le span d'icône est aria-cachable (pas de rôle sémantique fort)", () => {
      const wrapper = mountUI({ icon: "info" });
      const icon = wrapper.find(".material-icons-round");
      // L'icône ne doit pas avoir aria-label qui la rendrait vocalisée par erreur
      // (comportement nominal : pas d'attribut aria-label sur ce span)
      expect(icon.attributes("aria-label")).toBeUndefined();
    });
  });

  // ─── Slot et composition ──────────────────────────────────────────────────

  describe("Slot — composition UI", () => {
    it("rend une liste ul/li dans le slot", () => {
      const wrapper = mountUI(
        {},
        {
          default: `
            <ul>
              <li class="project-item">Projet A</li>
              <li class="project-item">Projet B</li>
            </ul>
          `,
        }
      );
      expect(wrapper.findAll(".project-item")).toHaveLength(2);
    });

    it("rend des composants imbriqués dans le slot", () => {
      const wrapper = mountUI(
        {},
        {
          default: `
            <div class="card">
              <h3>Titre carte</h3>
              <p>Description</p>
            </div>
          `,
        }
      );
      expect(wrapper.find(".card").exists()).toBe(true);
      expect(wrapper.find(".card h3").text()).toBe("Titre carte");
    });

    it("le slot peut être mis à jour dynamiquement", async () => {
      const wrapper = mount({
        components: { PortfolioSection },
        template: `
          <PortfolioSection title="Test">
            <p class="dynamic">{{ message }}</p>
          </PortfolioSection>
        `,
        data() {
          return { message: "Initial" };
        },
      });

      expect(wrapper.find(".dynamic").text()).toBe("Initial");
      await wrapper.setData({ message: "Mis à jour" });
      expect(wrapper.find(".dynamic").text()).toBe("Mis à jour");
    });
  });

  // ─── Snapshot léger ───────────────────────────────────────────────────────

  describe("Snapshot", () => {
    it("correspond au snapshot de référence (structure stable)", () => {
      const wrapper = mountUI(
        { title: "Formation", icon: "school", theme: "modern-academic" },
        { default: "<p>Contenu stable</p>" }
      );
      expect(wrapper.html()).toMatchSnapshot();
    });
  });
});