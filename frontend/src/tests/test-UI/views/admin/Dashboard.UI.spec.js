import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import Dashboard from "@/views/admin/Dashboard.vue";

describe("Dashboard - Tests UI", () => {
  it("affiche les demandes récentes", () => {
    const wrapper = mount(Dashboard);

    expect(wrapper.text()).toContain("Sara Bensaid");
    expect(wrapper.text()).toContain("Tazi Imane");
  });

  it("affiche les actions urgentes", () => {
    const wrapper = mount(Dashboard);

    expect(wrapper.text()).toContain("demandes en attente");
    expect(wrapper.text()).toContain("validations en attente");
    expect(wrapper.text()).toContain("signalements");
  });

  it("affiche le bouton consulter", () => {
    const wrapper = mount(Dashboard);

    const buttons = wrapper.findAll(".btn-light");

    expect(buttons.length).toBeGreaterThan(0);
  });
});
