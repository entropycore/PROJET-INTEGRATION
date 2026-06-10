import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import Dashboard from "@/views/admin/Dashboard.vue";

describe("Dashboard - Tests de fumee", () => {
  it("monte le composant sans erreur", () => {
    const wrapper = mount(Dashboard);

    expect(wrapper.exists()).toBe(true);
  });

  it("affiche la section dashboard", () => {
    const wrapper = mount(Dashboard);

    expect(wrapper.find(".admin-dashboard").exists()).toBe(true);
  });

  it("affiche les cartes statistiques", () => {
    const wrapper = mount(Dashboard);

    const cards = wrapper.findAll(".stat-card-ui");

    expect(cards.length).toBeGreaterThan(0);
  });
});
