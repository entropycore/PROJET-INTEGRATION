import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRouter, createWebHistory } from "vue-router";

import UserDetails from "@/views/admin/UserDetails.vue";

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
              major: "Génie Informatique",
              level: "Master",
              city: "Fès",
            },
          },
        },
      },
    })
  ),

  updateAdminUser: vi.fn(),
  updateUserStatus: vi.fn(),
  resetUserPassword: vi.fn(() =>
    Promise.resolve({
      data: {
        data: {
          temporaryPassword: "temp123",
        },
      },
    })
  ),
  approveProfessionalRequest: vi.fn(),
  deleteUser: vi.fn(),
}));

describe("Tests unitaires UserDetails", () => {
  let router;

  beforeEach(async () => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: "/admin/users/:userId",
          component: UserDetails,
        },
        {
          path: "/admin/users/:userId/edit",
          component: UserDetails,
        },
      ],
    });

    router.push("/admin/users/1");

    await router.isReady();
  });

  it("affiche correctement les informations utilisateur", async () => {
    const wrapper = mount(UserDetails, {
      global: {
        plugins: [router],
      },
    });

    await flushPromises();

    expect(wrapper.text()).toContain("Yassine Bennani");
    expect(wrapper.text()).toContain("yassine@test.com");
    expect(wrapper.text()).toContain("Étudiant");
  });

  it("charge correctement les données étudiant", async () => {
    const wrapper = mount(UserDetails, {
      global: {
        plugins: [router],
      },
    });

    await flushPromises();

    const inputs = wrapper.findAll("input, select, textarea");

    const valeurs = inputs.map((i) => i.element.value);

    expect(valeurs).toContain("Génie Informatique");
    expect(valeurs).toContain("Master");
    expect(valeurs).toContain("Fès");
  });

  it("ouvre la fenêtre de réinitialisation du mot de passe", async () => {
    const wrapper = mount(UserDetails, {
      global: {
        plugins: [router],
      },
    });

    await flushPromises();

    const boutons = wrapper.findAll("button");

    const resetBtn = boutons.find((b) =>
      b.text().includes("Réinitialiser le mot de passe")
    );

    await resetBtn.trigger("click");

    await flushPromises();

    expect(wrapper.text()).toContain("temp123");
    expect(wrapper.text()).toContain("Mot de passe réinitialisé");
  });

  it("active le mode édition", async () => {
    router.push("/admin/users/1/edit");

    await router.isReady();

    const wrapper = mount(UserDetails, {
      global: {
        plugins: [router],
      },
    });

    await flushPromises();

    expect(wrapper.text()).toContain("Enregistrer");
    expect(wrapper.text()).toContain("Annuler");
  });
});
