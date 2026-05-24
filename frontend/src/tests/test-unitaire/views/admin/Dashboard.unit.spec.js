import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import Dashboard from "@/views/admin/Dashboard.vue";

describe("Dashboard - Tests unitaires", () => {
  it("affiche le titre principal", () => {
    const wrapper = mount(Dashboard);

    expect(wrapper.text()).toContain("Administration de platform");
  });

  it("affiche les statistiques", () => {
    const wrapper = mount(Dashboard);

    expect(wrapper.text()).toContain("UTILISATEURS");
    expect(wrapper.text()).toContain("ÉTUDIANTS");
    expect(wrapper.text()).toContain("PROFESSEURS");
  });

  it("ouvre une demande récente", async () => {
    const wrapper = mount(Dashboard);

    const button = wrapper.find(".btn-light");

    await button.trigger("click");

    expect(wrapper.vm.selectedRequest).not.toBe(null);
  });
});
