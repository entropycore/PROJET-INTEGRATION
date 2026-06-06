import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import UserCreate from "@/views/admin/UserCreate.vue";

vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),

  useRoute: () => ({
    query: {
      role: "STUDENT",
    },
  }),
}));

describe("UserCreate - Tests unitaires", () => {
  it("affiche le titre de création", () => {
    const wrapper = mount(UserCreate, {
      global: {
        mocks: {
          $route: {
            query: {
              role: "STUDENT",
            },
          },
        },
      },
    });

    expect(wrapper.text()).toContain("Créer un étudiant");
  });

  it("change le rôle correctement", async () => {
    const wrapper = mount(UserCreate);

    const roleSelect = wrapper.find("select");

    await roleSelect.setValue("PROFESSOR");

    expect(wrapper.vm.form.role).toBe("PROFESSOR");
  });

  it("affiche les champs étudiant par défaut", () => {
    const wrapper = mount(UserCreate);

    expect(wrapper.text()).toContain("Filière");
    expect(wrapper.text()).toContain("Apogée");
  });

  it("affiche les champs professeur quand le rôle change", async () => {
    const wrapper = mount(UserCreate);

    const roleSelect = wrapper.find("select");

    await roleSelect.setValue("PROFESSOR");

    expect(wrapper.text()).toContain("Employee ID");
    expect(wrapper.text()).toContain("Département");
  });

  it("bascule la visibilite du mot de passe", async () => {
    const wrapper = mount(UserCreate);

    const button = wrapper.find(".password-toggle");

    expect(wrapper.vm.showPassword).toBe(false);

    await button.trigger("click");

    expect(wrapper.vm.showPassword).toBe(true);
  });
});
