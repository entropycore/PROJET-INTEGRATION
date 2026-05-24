import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import Reports from "@/views/admin/Reports.vue";

describe("Reports - Tests UI", () => {
  it("affiche les signalements", () => {
    const wrapper = mount(Reports);

    expect(wrapper.text()).toContain("Contenu inapproprié");
    expect(wrapper.text()).toContain("Commentaire offensant");
  });

  it("affiche les statistiques", () => {
    const wrapper = mount(Reports);

    expect(wrapper.text()).toContain("Signalements");
  });

  it("affiche la table des signalements", () => {
    const wrapper = mount(Reports);

    expect(wrapper.find(".table-card").exists()).toBe(true);
  });

  it("filtre les signalements par recherche", async () => {
    const wrapper = mount(Reports);

    wrapper.vm.search = "Sara";

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.filteredReports.length).toBe(1);
  });

  it("filtre les signalements par statut", async () => {
    const wrapper = mount(Reports);

    wrapper.vm.selectedStatus = "RESOLVED";

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.filteredReports.length).toBe(1);
  });
});
