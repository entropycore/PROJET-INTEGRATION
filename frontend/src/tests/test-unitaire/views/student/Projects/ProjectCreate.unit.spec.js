import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import ProjectCreate from "@/views/student/projects/ProjectCreate.vue";
import {
  getStudentProjectValidators,
  createStudentProject,
  submitStudentProject,
} from "@/services/studentProjectsApis";

const push = vi.fn();

vi.mock("@/assets/styles/student-project-edit.css", () => ({}));

vi.mock("@/services/studentProjectsApis", () => ({
  getStudentProjectValidators: vi.fn(),
  createStudentProject: vi.fn(),
  submitStudentProject: vi.fn(),
  uploadStudentProjectMedia: vi.fn(),
}));

vi.mock("vue-router", () => ({
  useRouter: () => ({ push }),
  RouterLink: { template: "<a><slot /></a>" },
}));

const validators = [
  {
    id: 10,
    fullName: "Professeur Ahmed",
    email: "ahmed@test.com",
    department: "Informatique",
    specialty: "Web",
  },
];

const mountPage = async () => {
  getStudentProjectValidators.mockResolvedValue({ data: { data: validators } });
  const wrapper = mount(ProjectCreate);
  await vi.dynamicImportSettled();
  return wrapper;
};

describe("ProjectCreate - Tests unitaires", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("désactive le bouton soumettre si le formulaire est incomplet", async () => {
    const wrapper = await mountPage();

    const submitButton = wrapper.find(".primary-action");

    expect(submitButton.attributes("disabled")).toBeDefined();
    expect(wrapper.text()).toContain("Complétez le titre");
  });

  it("ajoute une technologie", async () => {
    const wrapper = await mountPage();

    const input = wrapper.find('input[placeholder="Ajouter une technologie"]');
    await input.setValue("Vue.js");
    await input.trigger("keyup.enter");

    expect(wrapper.text()).toContain("Vue.js");
  });

  it("ajoute un lien personnalisé", async () => {
    const wrapper = await mountPage();

    const inputs = wrapper.findAll(".two-inputs input");
    await inputs[0].setValue("GitHub Frontend");
    await inputs[1].setValue("https://github.com/test");

    await wrapper.find(".two-inputs button").trigger("click");

    expect(wrapper.text()).toContain("GitHub Frontend");
    expect(wrapper.text()).toContain("Supprimer");
  });

  it("sélectionne un validateur", async () => {
    const wrapper = await mountPage();

    const validatorInput = wrapper.find('input[placeholder="Tapez le nom du validateur"]');

    await validatorInput.trigger("focus");
    await validatorInput.setValue("Ahmed");
    await validatorInput.trigger("input");

    await wrapper.find(".suggestion-item").trigger("mousedown");

    expect(validatorInput.element.value).toBe("Professeur Ahmed");
  });

  it("crée un brouillon et redirige vers la liste des projets", async () => {
    createStudentProject.mockResolvedValue({
      data: { data: { id: 99 } },
    });

    const wrapper = await mountPage();

    await wrapper.find(".secondary-action").trigger("click");

    expect(createStudentProject).toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith("/student/projects");
  });

  it("crée et soumet le projet si formulaire valide", async () => {
    createStudentProject.mockResolvedValue({
      data: { data: { id: 99 } },
    });
    submitStudentProject.mockResolvedValue({});

    const wrapper = await mountPage();

    const inputs = wrapper.findAll("input");
    await inputs[0].setValue("Projet Portfolio");

    await wrapper.find("textarea").setValue("Description complète du projet.");

    const validatorInput = wrapper.find('input[placeholder="Tapez le nom du validateur"]');
    await validatorInput.trigger("focus");
    await validatorInput.setValue("Ahmed");
    await validatorInput.trigger("input");
    await wrapper.find(".suggestion-item").trigger("mousedown");

    await wrapper.find(".primary-action").trigger("click");

    expect(createStudentProject).toHaveBeenCalled();
    expect(submitStudentProject).toHaveBeenCalledWith(99);
    expect(push).toHaveBeenCalledWith("/student/projects");
  });
});