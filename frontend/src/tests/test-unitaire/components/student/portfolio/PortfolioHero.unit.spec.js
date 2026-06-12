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

const defaultStudent = {
  firstName: "Youssef",
  lastName: "Benali",
  fullName: "Youssef Benali",
  role: "Développeur",
  major: "Génie Logiciel",
  school: "ENSIAS",
  city: "Rabat",
  email: "youssef@example.com",
  phone: "+212 6 12 34 56 78",
  profilePicture: null,
  githubUrl: "https://github.com/youssef",
  linkedinUrl: "https://linkedin.com/in/youssef",
};

const defaultCredibilityScore = {
  score: 78,
  label: "Très crédible",
};

const mountComponent = (studentOverrides = {}, scoreOverrides = {}) => {
  return mount(HeroSection, {
    props: {
      student: { ...defaultStudent, ...studentOverrides },
      credibilityScore: { ...defaultCredibilityScore, ...scoreOverrides },
    },
    global: {
      stubs: {
        "span.material-icons-round": true,
      },
    },
  });
};

describe("HeroSection — Tests Unitaires", () => {
  describe("initials", () => {
    it("génère les initiales en majuscules depuis firstName et lastName", () => {
      const wrapper = mountComponent();
      // Pas de photo → les initiales sont affichées
      expect(wrapper.find(".avatar-frame span").text()).toBe("YB");
    });

    it("retourne une chaîne vide si firstName et lastName sont absents", () => {
      const wrapper = mountComponent({ firstName: "", lastName: "" });
      expect(wrapper.find(".avatar-frame span").text()).toBe("");
    });

    it("gère un firstName absent (seulement lastName)", () => {
      const wrapper = mountComponent({ firstName: "", lastName: "Benali" });
      expect(wrapper.find(".avatar-frame span").text()).toBe("B");
    });

    it("gère un lastName absent (seulement firstName)", () => {
      const wrapper = mountComponent({ firstName: "Youssef", lastName: "" });
      expect(wrapper.find(".avatar-frame span").text()).toBe("Y");
    });
  });

  describe("normalizedScore", () => {
    it("retourne le score tel quel quand il est entre 0 et 100", () => {
      const wrapper = mountComponent({}, { score: 78 });
      // Le score normalisé est accessible indirectement via le DOM
      expect(wrapper.vm.normalizedScore).toBe(78);
    });

    it("clamp à 100 si le score dépasse 100", () => {
      const wrapper = mountComponent({}, { score: 150 });
      expect(wrapper.vm.normalizedScore).toBe(100);
    });

    it("clamp à 0 si le score est négatif", () => {
      const wrapper = mountComponent({}, { score: -10 });
      expect(wrapper.vm.normalizedScore).toBe(0);
    });

    it("retourne 0 si score est absent", () => {
      const wrapper = mountComponent({}, { score: undefined });
      expect(wrapper.vm.normalizedScore).toBe(0);
    });
  });

  describe("scoreStyle", () => {
    it("retourne un conic-gradient en fonction de animatedScoreProgress", () => {
      const wrapper = mountComponent({}, { score: 50 });
      // animatedScoreProgress démarre à 0 → gradient à 0deg
      expect(wrapper.vm.scoreStyle.background).toContain("conic-gradient");
    });

    it("calcule les degrés = progress * 3.6", () => {
      const wrapper = mountComponent();
      wrapper.vm.animatedScoreProgress = 50;
      const bg = wrapper.vm.scoreStyle.background;
      expect(bg).toContain("180deg");
    });
  });

  describe("Template — affichage du profil", () => {
    it("affiche le nom complet dans le h1", () => {
      const wrapper = mountComponent();
      expect(wrapper.find("h1").text()).toBe("Youssef Benali");
    });

    it("affiche le rôle et la filière", () => {
      const wrapper = mountComponent();
      const heroTitle = wrapper.find(".hero-title").text();
      expect(heroTitle).toContain("Développeur");
      expect(heroTitle).toContain("Génie Logiciel");
    });

    it("affiche l'école et la ville", () => {
      const wrapper = mountComponent();
      expect(wrapper.find(".hero-school").text()).toContain("ENSIAS");
      expect(wrapper.find(".hero-school").text()).toContain("Rabat");
    });

    it("affiche l'email, le téléphone et la ville dans hero-contact", () => {
      const wrapper = mountComponent();
      const contact = wrapper.find(".hero-contact").text();
      expect(contact).toContain("youssef@example.com");
      expect(contact).toContain("+212 6 12 34 56 78");
      expect(contact).toContain("Rabat");
    });

    it("affiche le badge 'Certifié'", () => {
      const wrapper = mountComponent();
      expect(wrapper.find(".corner-badge").text()).toContain("Certifié");
    });
  });

  describe("Template — avatar", () => {
    it("affiche l'image si profilePicture est fournie", () => {
      const wrapper = mountComponent({
        profilePicture: "https://example.com/photo.jpg",
        fullName: "Youssef Benali",
      });
      const img = wrapper.find("img");
      expect(img.exists()).toBe(true);
      expect(img.attributes("src")).toBe("https://example.com/photo.jpg");
      expect(img.attributes("alt")).toBe("Youssef Benali");
    });

    it("affiche les initiales si aucune photo n'est fournie", () => {
      const wrapper = mountComponent({ profilePicture: null });
      expect(wrapper.find("img").exists()).toBe(false);
      expect(wrapper.find(".avatar-frame span").exists()).toBe(true);
    });
  });

  describe("Template — liens sociaux", () => {
    it("affiche le lien GitHub si githubUrl est fourni", () => {
      const wrapper = mountComponent();
      const githubLink = wrapper.find('a[href="https://github.com/youssef"]');
      expect(githubLink.exists()).toBe(true);
      expect(githubLink.text()).toContain("GitHub");
    });

    it("n'affiche pas le lien GitHub si githubUrl est absent", () => {
      const wrapper = mountComponent({ githubUrl: null });
      expect(wrapper.find(".github-mark").exists()).toBe(false);
    });

    it("affiche le lien LinkedIn si linkedinUrl est fourni", () => {
      const wrapper = mountComponent();
      const linkedinLink = wrapper.find(
        'a[href="https://linkedin.com/in/youssef"]'
      );
      expect(linkedinLink.exists()).toBe(true);
      expect(linkedinLink.text()).toContain("LinkedIn");
    });

    it("n'affiche pas le lien LinkedIn si linkedinUrl est absent", () => {
      const wrapper = mountComponent({ linkedinUrl: null });
      const links = wrapper.findAll(".hero-links a");
      const texts = links.map((l) => l.text());
      expect(texts.every((t) => !t.includes("LinkedIn"))).toBe(true);
    });

    it("les liens s'ouvrent dans un nouvel onglet (target=_blank)", () => {
      const wrapper = mountComponent();
      wrapper.findAll(".hero-links a").forEach((a) => {
        expect(a.attributes("target")).toBe("_blank");
        expect(a.attributes("rel")).toContain("noopener");
      });
    });
  });

  describe("Template — score card", () => {
    it("affiche le label de crédibilité", () => {
      const wrapper = mountComponent();
      expect(wrapper.find(".score-card p").text()).toBe("Très crédible");
    });

    it("affiche 'Score crédibilité'", () => {
      const wrapper = mountComponent();
      expect(wrapper.find(".score-card small").text()).toBe(
        "Score crédibilité"
      );
    });
  });

  describe("Props — theme", () => {
    it("applique la classe theme par défaut 'theme-modern-academic'", () => {
      const wrapper = mountComponent();
      expect(wrapper.find(".hero-section").classes()).toContain(
        "theme-modern-academic"
      );
    });

    it("applique un theme personnalisé", () => {
      const wrapper = mount(HeroSection, {
        props: {
          student: defaultStudent,
          credibilityScore: defaultCredibilityScore,
          theme: "dark-minimalist",
        },
      });
      expect(wrapper.find(".hero-section").classes()).toContain(
        "theme-dark-minimalist"
      );
    });
  });
});
