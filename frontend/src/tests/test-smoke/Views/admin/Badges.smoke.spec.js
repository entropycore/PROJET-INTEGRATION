import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import Badges from "@/views/admin/Badges.vue";

describe("Badges - Tests de fumee", () => {
  it("monte le composant sans erreur", () => {
    const wrapper = mount(Badges);

    expect(wrapper.exists()).toBe(true);
  });

  it("affiche le titre principal", () => {
    const wrapper = mount(Badges);

    expect(wrapper.text()).toContain("Système de badges");
  });

  it("affiche le bouton Nouveau badge", () => {
    const wrapper = mount(Badges);

    expect(wrapper.find(".primary-btn").exists()).toBe(true);
  });
});
