import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Dashboard from "@/views/admin/Dashboard.vue";

vi.mock("@/services/adminService", () => ({
  getAdminDashboard: vi.fn(() =>
    Promise.resolve({
      data: {
        data: {
          summaryCards: {
            totalUsers: { value: 120 },
            totalStudents: { value: 80 },
            totalProfessors: { value: 12 },
            pendingRequests: { value: 3 },
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
              createdAt: "2026-05-20T10:00:00.000Z",
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

describe("Dashboard - Tests unitaires", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("affiche le titre principal", async () => {
    const wrapper = await mountDashboard();

    expect(wrapper.text()).toContain("Administration de platform");
  });

  it("affiche les statistiques", async () => {
    const wrapper = await mountDashboard();

    expect(wrapper.text()).toContain("UTILISATEURS");
    expect(wrapper.text()).toContain("ÉTUDIANTS");
    expect(wrapper.text()).toContain("PROFESSEURS");
  });

  it("redirige au clic sur une demande recente", async () => {
    const wrapper = await mountDashboard();

    await wrapper.find(".request-item.clickable").trigger("click");

    expect(push).toHaveBeenCalledWith({
      path: "/admin/users",
      query: {
        role: "PROFESSIONAL",
        status: "PENDING",
        itemId: 1,
      },
    });
  });
});
