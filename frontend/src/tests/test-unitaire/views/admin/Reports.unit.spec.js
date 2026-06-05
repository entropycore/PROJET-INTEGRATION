import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Reports from "@/views/admin/Reports.vue";

vi.mock("vue-router", () => ({
  useRoute: () => ({ query: {} }),
}));

const reports = [
  {
    id: 1,
    reason: "Contenu inapproprié",
    description: "Portfolio non conforme",
    targetType: "PORTFOLIO",
    targetId: 10,
    reportedBy: { fullName: "Sara Bensaid", email: "sara@example.com" },
    status: "PENDING",
    createdAt: "2026-05-20T10:00:00.000Z",
  },
];

vi.mock("@/services/adminReportsApi", () => ({
  getReports: vi.fn(() => Promise.resolve({ items: reports })),
  getReportDetails: vi.fn((id) =>
    Promise.resolve(reports.find((report) => report.id === id)),
  ),
  resolveReport: vi.fn(() => Promise.resolve()),
  rejectReport: vi.fn(() => Promise.resolve()),
  deleteReportedTarget: vi.fn(() => Promise.resolve()),
}));

const mountReports = async () => {
  const wrapper = mount(Reports);
  await flushPromises();
  return wrapper;
};

describe("Reports - Tests unitaires", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("affiche le titre principal", async () => {
    const wrapper = await mountReports();

    expect(wrapper.text()).toContain("Signalements");
  });

  it("ouvre et ferme les details d'un signalement", async () => {
    const wrapper = await mountReports();

    await wrapper.vm.handleView(wrapper.vm.reports[0]);
    await flushPromises();

    expect(wrapper.vm.showDetailsModal).toBe(true);
    expect(wrapper.vm.selectedReport).toMatchObject({ id: 1 });

    wrapper.vm.closeDetailsModal();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.showDetailsModal).toBe(false);
  });
});
