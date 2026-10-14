import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import HeroSection from "@/components/student/portfolio/PortfolioHero.vue";

beforeEach(() => {
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((cb) => {
      cb(performance.now());
      return 1;
    })
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const minimalStudent = {
  firstName: "Sara",
  lastName: "El Idrissi",
  fullName: "Sara El Idrissi",
  role: "Designer UX",
  major: "Informatique",
  school: "ENCG",
  city: "Casablanca",
  email: "sara@test.com",
  phone: "+212 6 00 00 00 00",
  profilePicture: null,
  githubUrl: null,
  linkedinUrl: null,
};

const minimalScore = { score: 60, label: "Crédible" };

describe("HeroSection — Smoke Tests", () => {
  it("monte sans erreur avec les props minimales requises", () => {
    expect(() =>
      mount(HeroSection, {
        props: { student: minimalStudent, credibilityScore: minimalScore },
      })
    ).not.toThrow();
  });

  it("rend l'élément racine .hero-section", () => {
    const wrapper = mount(HeroSection, {
      props: { student: minimalStudent, credibilityScore: minimalScore },
    });
    expect(wrapper.find(".hero-section").exists()).toBe(true);
  });

  it("affiche au moins un nœud de texte non vide", () => {
    const wrapper = mount(HeroSection, {
      props: { student: minimalStudent, credibilityScore: minimalScore },
    });
    expect(wrapper.text().trim().length).toBeGreaterThan(0);
  });

  it("rend sans erreur quand le score est 0", () => {
    expect(() =>
      mount(HeroSection, {
        props: {
          student: minimalStudent,
          credibilityScore: { score: 0, label: "Non évalué" },
        },
      })
    ).not.toThrow();
  });

  it("rend sans erreur quand le score est 100", () => {
    expect(() =>
      mount(HeroSection, {
        props: {
          student: minimalStudent,
          credibilityScore: { score: 100, label: "Excellent" },
        },
      })
    ).not.toThrow();
  });

  it("rend sans erreur avec un theme personnalisé", () => {
    expect(() =>
      mount(HeroSection, {
        props: {
          student: minimalStudent,
          credibilityScore: minimalScore,
          theme: "custom-theme",
        },
      })
    ).not.toThrow();
  });

  it("rend sans erreur avec une profilePicture fournie", () => {
    expect(() =>
      mount(HeroSection, {
        props: {
          student: {
            ...minimalStudent,
            profilePicture: "https://example.com/avatar.jpg",
          },
          credibilityScore: minimalScore,
        },
      })
    ).not.toThrow();
  });

  it("rend sans erreur avec GitHub et LinkedIn fournis", () => {
    expect(() =>
      mount(HeroSection, {
        props: {
          student: {
            ...minimalStudent,
            githubUrl: "https://github.com/sara",
            linkedinUrl: "https://linkedin.com/in/sara",
          },
          credibilityScore: minimalScore,
        },
      })
    ).not.toThrow();
  });

  it("contient le bloc .score-card", () => {
    const wrapper = mount(HeroSection, {
      props: { student: minimalStudent, credibilityScore: minimalScore },
    });
    expect(wrapper.find(".score-card").exists()).toBe(true);
  });

  it("contient le bloc .hero-profile", () => {
    const wrapper = mount(HeroSection, {
      props: { student: minimalStudent, credibilityScore: minimalScore },
    });
    expect(wrapper.find(".hero-profile").exists()).toBe(true);
  });
});
