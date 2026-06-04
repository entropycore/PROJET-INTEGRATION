import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import Reports from "@/views/admin/Reports.vue";

describe("Reports - Tests de fumee", () => {
  it("monte le composant sans erreur", () => {
    const wrapper = mount(Reports);

    expect(wrapper.exists()).toBe(true);
  });

  it("affiche la page des rapports", () => {
    const wrapper = mount(Reports);

    expect(wrapper.find(".reports-page").exists()).toBe(true);
  });

  it("affiche les cartes statistiques", () => {
    const wrapper = mount(Reports);

    expect(wrapper.find(".table-card").exists()).toBe(true);
  });
});
