import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import PortfolioSection from "@/components/student/portfolio/PortfolioSection.vue";

const mountComponent = (propsOverrides = {}, slots = {}) => {
  return mount(PortfolioSection, {
    props: {
      title: "Mes Projets",
      ...propsOverrides,
    },
    slots,
  });
};

describe("PortfolioSection — Tests Unitaires", () => {
  // ─── Props: title ─────────────────────────────────────────────────────────

  describe("Props — title", () => {
    it("affiche le title dans le h2", () => {
      const wrapper = mountComponent({ title: "Expériences" });
      expect(wrapper.find("h2").text()).toContain("Expériences");
    });

    it("affiche un title avec des caractères spéciaux", () => {
      const wrapper = mountComponent({ title: "Compétences & Outils" });
      expect(wrapper.find("h2").text()).toContain("Compétences & Outils");
    });

    it("affiche un title long sans troncature", () => {
      const longTitle = "Projets académiques réalisés durant la formation";
      const wrapper = mountComponent({ title: longTitle });
      expect(wrapper.find("h2").text()).toContain(longTitle);
    });
  });

  // ─── Props: icon ──────────────────────────────────────────────────────────

  describe("Props — icon", () => {
    it("affiche l'icône par défaut 'folder' si non fournie", () => {
      const wrapper = mountComponent();
      expect(wrapper.find(".material-icons-round").text()).toBe("folder");
    });

    it("affiche l'icône fournie via la prop", () => {
      const wrapper = mountComponent({ icon: "work" });
      expect(wrapper.find(".material-icons-round").text()).toBe("work");
    });

    it("affiche une icône quelconque correctement", () => {
      const wrapper = mountComponent({ icon: "school" });
      expect(wrapper.find(".material-icons-round").text()).toBe("school");
    });
  });

  // ─── Props: theme ─────────────────────────────────────────────────────────

  describe("Props — theme", () => {
    it("applique la classe 'theme-modern-academic' par défaut", () => {
      const wrapper = mountComponent();
      expect(wrapper.find(".portfolio-section").classes()).toContain(
        "theme-modern-academic"
      );
    });

    it("applique la classe theme personnalisée", () => {
      const wrapper = mountComponent({ theme: "dark-pro" });
      expect(wrapper.find(".portfolio-section").classes()).toContain(
        "theme-dark-pro"
      );
    });

    it("préfixe toujours le theme avec 'theme-'", () => {
      const wrapper = mountComponent({ theme: "retro" });
      const classes = wrapper.find(".portfolio-section").classes();
      expect(classes.some((c) => c.startsWith("theme-"))).toBe(true);
      expect(classes).toContain("theme-retro");
    });
  });

  // ─── Slot ─────────────────────────────────────────────────────────────────

  describe("Slot — contenu", () => {
    it("rend le contenu du slot par défaut", () => {
      const wrapper = mountComponent(
        {},
        { default: "<p class='slot-content'>Contenu injecté</p>" }
      );
      expect(wrapper.find(".slot-content").exists()).toBe(true);
      expect(wrapper.find(".slot-content").text()).toBe("Contenu injecté");
    });

    it("rend plusieurs éléments dans le slot", () => {
      const wrapper = mountComponent(
        {},
        {
          default: `
            <div class="item">Item 1</div>
            <div class="item">Item 2</div>
            <div class="item">Item 3</div>
          `,
        }
      );
      expect(wrapper.findAll(".item")).toHaveLength(3);
    });

    it("rend sans erreur si le slot est vide", () => {
      expect(() => mountComponent()).not.toThrow();
    });

    it("le contenu du slot est bien enfant de .portfolio-section", () => {
      const wrapper = mountComponent(
        {},
        { default: "<span class='child'>test</span>" }
      );
      const section = wrapper.find(".portfolio-section");
      expect(section.find(".child").exists()).toBe(true);
    });
  });

  // ─── Structure HTML ───────────────────────────────────────────────────────

  describe("Structure HTML", () => {
    it("l'élément racine est une balise <section>", () => {
      const wrapper = mountComponent();
      expect(wrapper.element.tagName.toLowerCase()).toBe("section");
    });

    it("possède la classe 'portfolio-section'", () => {
      const wrapper = mountComponent();
      expect(wrapper.find(".portfolio-section").exists()).toBe(true);
    });

    it("le h2 contient bien le span.material-icons-round", () => {
      const wrapper = mountComponent();
      const h2 = wrapper.find("h2");
      expect(h2.find(".material-icons-round").exists()).toBe(true);
    });

    it("le span d'icône est positionné avant le texte dans le h2", () => {
      const wrapper = mountComponent({ title: "Formation", icon: "school" });
      const h2 = wrapper.find("h2");
      const children = h2.element.childNodes;
      const iconNode = Array.from(children).find(
        (n) =>
          n.nodeType === 1 &&
          n.classList.contains("material-icons-round")
      );
      const textNode = Array.from(children).find(
        (n) => n.nodeType === 3 && n.textContent.trim() === "Formation"
      );
      const iconIndex = Array.from(children).indexOf(iconNode);
      const textIndex = Array.from(children).indexOf(textNode);
      expect(iconIndex).toBeLessThan(textIndex);
    });
  });
});