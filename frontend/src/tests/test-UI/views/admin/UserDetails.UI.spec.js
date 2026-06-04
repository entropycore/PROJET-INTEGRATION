import { mount, flushPromises } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AdminUserDetails from "@/views/admin/UserDetails.vue";

vi.mock("@/services/adminService", () => ({
  getAdminUserById: vi.fn(() =>
    Promise.resolve({
      data: {
        data: {
          id: "1",
          firstName: "Yassine",
          lastName: "Bennani",
          email: "yassine@test.com",
          phone: "0600000000",
          role: "STUDENT",
          accountStatus: "ACTIVE",
          emailVerified: true,
          createdAt: "2025-01-01",
          lastLoginAt: "2025-02-01",
          roleDetails: {
            student: {
              major: "Informatique",
              level: "Master",
              apogeeCode: "12345",
              cne: "CNE123",
              city: "Fès",
              linkedinUrl: "https://linkedin.com/test",
            },
          },
        },
      },
    })
  ),

  updateAdminUser: vi.fn(() => Promise.resolve()),
  updateUserStatus: vi.fn(() => Promise.resolve()),
  resetUserPassword: vi.fn(() =>
    Promise.resolve({
      data: {
        data: {
          temporaryPassword: "temp123456",
        },
      },
    })
  ),
  approveProfessionalRequest: vi.fn(() => Promise.resolve()),
  deleteUser: vi.fn(() => Promise.resolve()),
}));

describe("AdminUserDetails - Tests UI", () => {
  let router;

  beforeEach(async () => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: "/admin/users/:userId",
          component: AdminUserDetails,
        },
        {
          path: "/admin/users/:userId/edit",
          component: AdminUserDetails,
        },
      ],
    });

    router.push("/admin/users/1");
    await router.isReady();
  });

  it("affiche correctement les informations utilisateur", async () => {
    const wrapper = mount(AdminUserDetails, {
      global: {
        plugins: [router],
      },
    });

    await flushPromises();

    expect(wrapper.text()).toContain("Yassine Bennani");
    expect(wrapper.text()).toContain("yassine@test.com");
    expect(wrapper.text()).toContain("Étudiant");
  });

  it("affiche le bouton de modification", async () => {
    const wrapper = mount(AdminUserDetails, {
      global: {
        plugins: [router],
      },
    });

    await flushPromises();

    expect(wrapper.find(".primary-btn").exists()).toBe(true);
  });

  it("ouvre la fenetre de reinitialisation du mot de passe", async () => {
    const wrapper = mount(AdminUserDetails, {
      global: {
        plugins: [router],
      },
    });

    await flushPromises();

    const buttons = wrapper.findAll("button");

    const resetBtn = buttons.find((b) =>
      b.text().includes("Réinitialiser le mot de passe")
    );

    await resetBtn.trigger("click");

    await flushPromises();

    expect(wrapper.text()).toContain("temp123456");
    expect(wrapper.text()).toContain("Mot de passe réinitialisé");
  });
it("affiche les details du role etudiant", async () => {
  const wrapper = mount(AdminUserDetails, {
    global: {
      plugins: [router],
    },
  });

  await flushPromises();

  const inputs = wrapper.findAll("input");

  const values = inputs.map((i) => i.element.value);

  expect(values).toContain("Informatique");
  expect(values).toContain("Master");
  expect(values).toContain("Fès");
});
});
