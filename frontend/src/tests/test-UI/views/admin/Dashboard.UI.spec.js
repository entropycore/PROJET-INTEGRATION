import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Dashboard from "@/views/admin/Dashboard.vue";

vi.mock("@/services/adminService", () => ({
  getAdminDashboard: vi.fn(() =>
    Promise.resolve({
      data: {
        data: {
          summaryCards: {
            totalUsers: { value: 120, variation: "+4" },
            totalStudents: { value: 80, variation: "+2" },
            totalProfessors: { value: 12, variation: "+1" },
            pendingRequests: { value: 3, variation: "à traiter" },
          },
          urgentActions: {
            pendingAccessRequests: 3,
            pendingValidations: 4,
            reports: 2,
          },
          recentRequests: [
            {
              id: 1,
              type: "ACCESS_REQUEST",
              requesterName: "Sara Bensaid",
              email: "sara@example.com",
              organization: "ENSAT",
              createdAt: "2026-05-20T10:00:00.000Z",
            },
            {
              id: 2,
              type: "PROJECT",
              requesterName: "Tazi Imane",
              email: "imane@example.com",
              createdAt: "2026-05-20T11:00:00.000Z",
            },
          ],
        },
      },
    }),
  ),
}));

const push = vi.fn();

vi.mock("vue-router", () => ({
  useRouter: () => ({ push }),
}));

const mountDashboard = async () => {
  const wrapper = mount(Dashboard, {
    global: {
      stubs: {
        RouterLink: {
          props: ["to"],
          template: '<a :href="to"><slot /></a>',
        },
      },
    },
  });
  await flushPromises();
  return wrapper;
};

describe("Dashboard - Tests UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("affiche les demandes recentes", async () => {
    const wrapper = await mountDashboard();

    expect(wrapper.text()).toContain("Sara Bensaid");
    expect(wrapper.text()).toContain("Tazi Imane");
  });

  it("affiche les actions urgentes", async () => {
    const wrapper = await mountDashboard();

    expect(wrapper.text()).toContain("demandes en attente");
    expect(wrapper.text()).toContain("validations en attente");
    expect(wrapper.text()).toContain("signalements");
  });

  it("affiche le bouton consulter", async () => {
    const wrapper = await mountDashboard();

    expect(wrapper.findAll(".btn-light").length).toBeGreaterThan(0);
  });
});
