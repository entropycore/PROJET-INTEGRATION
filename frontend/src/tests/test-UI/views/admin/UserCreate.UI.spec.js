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

describe("UserCreate - Tests UI", () => {
  it("affiche le formulaire", () => {
    const wrapper = mount(UserCreate);

    expect(wrapper.find(".details-grid").exists()).toBe(true);
  });

  it("affiche le bouton créer utilisateur", () => {
    const wrapper = mount(UserCreate);

    expect(wrapper.text()).toContain("Créer utilisateur");
  });

  it("remplit les champs du formulaire", async () => {
    const wrapper = mount(UserCreate);

    const inputs = wrapper.findAll("input");

    await inputs[0].setValue("Sara");
    await inputs[1].setValue("Bensaid");

    expect(wrapper.vm.form.firstName).toBe("Sara");
    expect(wrapper.vm.form.lastName).toBe("Bensaid");
  });

  it("affiche les champs recruteur", async () => {
    const wrapper = mount(UserCreate);

    const roleSelect = wrapper.find("select");

    await roleSelect.setValue("PROFESSIONAL");

    expect(wrapper.text()).toContain("Entreprise");
    expect(wrapper.text()).toContain("Secteur");
  });

  it("affiche les champs administrateur", async () => {
    const wrapper = mount(UserCreate);

    const roleSelect = wrapper.find("select");

    await roleSelect.setValue("ADMINISTRATOR");

    expect(wrapper.text()).toContain("Niveau admin");
  });
});
