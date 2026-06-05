import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import Reports from "@/views/admin/Reports.vue";

vi.mock("vue-router", () => ({
  useRoute: () => ({ query: {} }),
}));

vi.mock("@/services/adminReportsApi", () => ({
  getReports: vi.fn(() => Promise.resolve({ items: [] })),
  getReportDetails: vi.fn(),
  resolveReport: vi.fn(),
  rejectReport: vi.fn(),
  deleteReportedTarget: vi.fn(),
}));

describe("Reports - Tests de fumee", () => {
  it("monte le composant sans erreur", async () => {
    const wrapper = mount(Reports);
    await flushPromises();

    expect(wrapper.exists()).toBe(true);
  });

  it("affiche la page des rapports", async () => {
    const wrapper = mount(Reports);
    await flushPromises();

    expect(wrapper.find(".reports-page").exists()).toBe(true);
  });

  it("affiche les cartes statistiques", async () => {
    const wrapper = mount(Reports);
    await flushPromises();

    expect(wrapper.find(".table-card").exists()).toBe(true);
  });
});
