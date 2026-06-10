import { mount, flushPromises } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import { describe, it, expect, vi } from "vitest";
import AdminUserDetails from "@/views/admin/UserDetails.vue";

vi.mock("@/services/adminService", () => ({
  getAdminUserById: vi.fn(() =>
    Promise.resolve({
      data: {
        data: {
          firstName: "Fumee",
          lastName: "Test",
          email: "smoke@test.com",
          role: "STUDENT",
          accountStatus: "ACTIVE",
          roleDetails: {
            student: {},
          },
        },
      },
    })
  ),

  updateAdminUser: vi.fn(),
  updateUserStatus: vi.fn(),
  resetUserPassword: vi.fn(),
  approveProfessionalRequest: vi.fn(),
  deleteUser: vi.fn(),
}));

describe("AdminUserDetails - Test de fumee", () => {
  it("monte le composant sans planter", async () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: "/admin/users/:userId",
          component: AdminUserDetails,
        },
      ],
    });

    router.push("/admin/users/1");
    await router.isReady();

    const wrapper = mount(AdminUserDetails, {
      global: {
        plugins: [router],
      },
    });

    await flushPromises();

    expect(wrapper.exists()).toBe(true);
  });
});
