import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import PortfolioSection from "@/components/student/portfolio/PortfolioSection.vue";

describe("PortfolioSection — Smoke Tests", () => {
  it("monte sans erreur avec la prop title uniquement", () => {
    expect(() =>
      mount(PortfolioSection, { props: { title: "Test" } })
    ).not.toThrow();
  });

  it("monte sans erreur avec toutes les props fournies", () => {
    expect(() =>
      mount(PortfolioSection, {
        props: { title: "Projets", icon: "code", theme: "dark-pro" },
      })
    ).not.toThrow();
  });

  it("rend l'élément racine .portfolio-section", () => {
    const wrapper = mount(PortfolioSection, {
      props: { title: "Smoke" },
    });
    expect(wrapper.find(".portfolio-section").exists()).toBe(true);
  });

  it("rend un h2 visible", () => {
    const wrapper = mount(PortfolioSection, {
      props: { title: "Compétences" },
    });
    expect(wrapper.find("h2").exists()).toBe(true);
  });

  it("rend sans erreur avec un slot complexe", () => {
    expect(() =>
      mount(PortfolioSection, {
        props: { title: "Projets" },
        slots: {
          default: `
            <ul>
              <li>Item A</li>
              <li>Item B</li>
            </ul>
          `,
        },
      })
    ).not.toThrow();
  });

  it("rend sans erreur avec un theme vide", () => {
    expect(() =>
      mount(PortfolioSection, {
        props: { title: "Test", theme: "" },
      })
    ).not.toThrow();
  });

  it("rend sans erreur avec un titre vide", () => {
    expect(() =>
      mount(PortfolioSection, { props: { title: "" } })
    ).not.toThrow();
  });

  it("rend sans erreur avec une icône inconnue", () => {
    expect(() =>
      mount(PortfolioSection, {
        props: { title: "Test", icon: "icone_inexistante_xyz" },
      })
    ).not.toThrow();
  });

  it("produit du texte non vide quand title est fourni", () => {
    const wrapper = mount(PortfolioSection, {
      props: { title: "Mon Portfolio" },
    });
    expect(wrapper.text().trim().length).toBeGreaterThan(0);
  });

  it("monte plusieurs fois de suite sans fuite mémoire apparente", () => {
    for (let i = 0; i < 5; i++) {
      expect(() =>
        mount(PortfolioSection, {
          props: { title: `Section ${i}`, icon: "star", theme: "modern" },
        })
      ).not.toThrow();
    }
  });
});