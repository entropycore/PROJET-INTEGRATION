import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Reports from "@/views/admin/Reports.vue";

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
  {
    id: 2,
    reason: "Commentaire offensant",
    description: "Commentaire à modérer",
    targetType: "COMMENT",
    targetId: 11,
    reportedBy: { fullName: "Tazi Imane", email: "imane@example.com" },
    status: "RESOLVED",
    createdAt: "2026-05-20T11:00:00.000Z",
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

describe("Reports - Tests UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("affiche les signalements", async () => {
    const wrapper = await mountReports();

    expect(wrapper.text()).toContain("Contenu inapproprié");
    expect(wrapper.text()).toContain("Commentaire offensant");
  });

  it("affiche les statistiques et la table", async () => {
    const wrapper = await mountReports();

    expect(wrapper.text()).toContain("Signalements");
    expect(wrapper.find(".table-card").exists()).toBe(true);
  });

  it("filtre les signalements par recherche", async () => {
    const wrapper = await mountReports();

    wrapper.vm.search = "Sara";
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.filteredReports).toHaveLength(2);
    expect(wrapper.vm.search).toBe("Sara");
  });

  it("charge les signalements avec le service mocke", async () => {
    const wrapper = await mountReports();

    expect(wrapper.vm.reports).toHaveLength(2);
  });
});
