import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import Reports from "@/views/admin/Reports.vue";

describe("Reports - Tests unitaires", () => {
  it("affiche le titre principal", () => {
    const wrapper = mount(Reports);

    expect(wrapper.text()).toContain("Signalements");
  });

  it("ouvre les détails d’un signalement", async () => {
    const wrapper = mount(Reports);

    wrapper.vm.handleView(wrapper.vm.reports[0]);

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.showDetailsModal).toBe(true);
    expect(wrapper.vm.selectedReport).not.toBe(null);
  });

  it("met à jour le statut d’un signalement", () => {
    const wrapper = mount(Reports);

    wrapper.vm.updateReportStatus(1, "RESOLVED");

    const updated = wrapper.vm.reports.find((r) => r.id === 1);

    expect(updated.status).toBe("RESOLVED");
  });

  it("ferme le modal des détails", async () => {
    const wrapper = mount(Reports);

    wrapper.vm.handleView(wrapper.vm.reports[0]);

    await wrapper.vm.$nextTick();

    wrapper.vm.closeDetailsModal();

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.showDetailsModal).toBe(false);
  });

  it("rejette un signalement", async () => {
    window.prompt = vi.fn(() => "Contenu invalide");

    const wrapper = mount(Reports);

    await wrapper.vm.handleReject(wrapper.vm.reports[0]);

    expect(wrapper.vm.reports[0].status).toBe("REJECTED");
  });
});
