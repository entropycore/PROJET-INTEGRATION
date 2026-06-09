import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import ProjectCreate from "@/views/student/projects/ProjectCreate.vue";
import { getStudentProjectValidators } from "@/services/studentProjectsApis";

vi.mock("@/assets/styles/student-project-edit.css", () => ({}));

vi.mock("@/services/studentProjectsApis", () => ({
  getStudentProjectValidators: vi.fn(),
  createStudentProject: vi.fn(),
  submitStudentProject: vi.fn(),
  uploadStudentProjectMedia: vi.fn(),
}));

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: vi.fn() }),
  RouterLink: { template: "<a><slot /></a>" },
}));

describe("ProjectCreate - Tests UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getStudentProjectValidators.mockResolvedValue({
      data: {
        data: [{ id: 1, fullName: "Prof Test", email: "prof@test.com" }],
      },
    });
  });

  it("affiche la structure principale de l’interface", async () => {
    const wrapper = mount(ProjectCreate);
    await vi.dynamicImportSettled();

    expect(wrapper.find(".project-edit-page").exists()).toBe(true);
    expect(wrapper.find(".edit-header").exists()).toBe(true);
    expect(wrapper.find(".edit-layout").exists()).toBe(true);
    expect(wrapper.find(".edit-main-column").exists()).toBe(true);
    expect(wrapper.find(".edit-side-column").exists()).toBe(true);
  });

  it("affiche les cartes importantes", async () => {
    const wrapper = mount(ProjectCreate);
    await vi.dynamicImportSettled();

    expect(wrapper.text()).toContain("Informations principales");
    expect(wrapper.text()).toContain("Technologies utilisées");
    expect(wrapper.text()).toContain("Liens du projet");
    expect(wrapper.text()).toContain("Captures d’écran");
    expect(wrapper.text()).toContain("Pièces jointes");
  });

  it("affiche la liste des validateurs au focus", async () => {
    const wrapper = mount(ProjectCreate);
    await vi.dynamicImportSettled();

    const input = wrapper.find('input[placeholder="Tapez le nom du validateur"]');

    await input.trigger("focus");

    expect(wrapper.find(".suggestions-list").exists()).toBe(true);
    expect(wrapper.find(".suggestion-item").exists()).toBe(true);
  });

  it("affiche le message warning quand le formulaire est incomplet", async () => {
    const wrapper = mount(ProjectCreate);
    await vi.dynamicImportSettled();

    expect(wrapper.find(".edit-warning-card").exists()).toBe(true);
    expect(wrapper.text()).toContain("Complétez le titre");
  });
});