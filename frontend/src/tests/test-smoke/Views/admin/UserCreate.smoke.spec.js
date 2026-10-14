import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import UserCreate from "@/views/admin/UserCreate.vue";

vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),

  useRoute: () => ({
    query: {
      role: "STUDENT",
    },
  }),
}));

describe("UserCreate - Tests de fumee", () => {
  it("monte le composant sans erreur", () => {
    const wrapper = mount(UserCreate);

    expect(wrapper.exists()).toBe(true);
  });

  it("affiche la page de creation utilisateur", () => {
    const wrapper = mount(UserCreate);

    expect(wrapper.find(".admin-user-details-page").exists()).toBe(true);
  });

  it("affiche les cartes du formulaire", () => {
    const wrapper = mount(UserCreate);

    const cards = wrapper.findAll(".details-card");

    expect(cards.length).toBeGreaterThan(0);
  });

  it("affiche le bouton retour", () => {
    const wrapper = mount(UserCreate);

    expect(wrapper.find(".back-btn").exists()).toBe(true);
  });
});
