import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import ProjectEdit from "@/views/student/projects/ProjectEdit.vue";

import {
  getStudentProjectById,
  getStudentProjectValidators,
  updateStudentProject,
  submitStudentProject,
  uploadStudentProjectMedia,
} from "@/services/studentProjectsApis";

const push = vi.fn();

vi.mock("@/assets/styles/student-project-edit.css", () => ({}));

vi.mock("@/services/studentProjectsApis", () => ({
  getStudentProjectById: vi.fn(),
  getStudentProjectValidators: vi.fn(),
  updateStudentProject: vi.fn(),
  submitStudentProject: vi.fn(),
  uploadStudentProjectMedia: vi.fn(),
  deleteStudentProjectMedia: vi.fn(),
}));

vi.mock("vue-router", () => ({
  useRoute: () => ({
    params: { id: "1" },
  }),
  useRouter: () => ({
    push,
  }),
  RouterLink: {
    template: "<a><slot /></a>",
  },
}));

const projectMock = {
  id: 1,
  title: "Projet Portfolio",
  type: "Module",
  description: "Description projet",
  role: "Frontend",
  teamSize: "4",
  validatorId: 10,
  validatorName: "Prof Ahmed",
  technologies: ["Vue"],
  extraLinks: [],
  screenshots: [],
  attachments: [],
};

const validatorsMock = [
  {
    id: 10,
    fullName: "Prof Ahmed",
    email: "ahmed@test.com",
    department: "Info",
    specialty: "Web",
  },
];

const mountComponent = async () => {
  getStudentProjectById.mockResolvedValue({
    data: { data: projectMock },
  });

  getStudentProjectValidators.mockResolvedValue({
    data: { data: validatorsMock },
  });

  const wrapper = mount(ProjectEdit);

  await vi.dynamicImportSettled();

  return wrapper;
};

describe("ProjectEdit Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("affiche l'état de chargement si le projet ne se charge pas", async () => {
    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});
    getStudentProjectById.mockRejectedValueOnce(new Error("Project failed"));
    getStudentProjectValidators.mockResolvedValue({
      data: { data: validatorsMock },
    });

    const wrapper = mount(ProjectEdit);

    await vi.dynamicImportSettled();

    expect(wrapper.find(".edit-header").exists()).toBe(false);
    expect(consoleWarnSpy).toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });

  it("continue si le chargement des validateurs échoue", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    getStudentProjectById.mockResolvedValue({
      data: { data: projectMock },
    });
    getStudentProjectValidators.mockRejectedValueOnce(
      new Error("Validators failed")
    );

    const wrapper = mount(ProjectEdit);

    await vi.dynamicImportSettled();

    expect(wrapper.find(".edit-header").exists()).toBe(true);
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("ajoute une technologie", async () => {
    const wrapper = await mountComponent();

    const input = wrapper.find(
      'input[placeholder="Ajouter une technologie"]',
    );

    await input.setValue("Laravel");
    await input.trigger("keyup.enter");

    expect(wrapper.text()).toContain("Laravel");
  });

  it("supprime une technologie", async () => {
    const wrapper = await mountComponent();

    const removeBtn =
      wrapper.find(".project-tech-pill button");

    await removeBtn.trigger("click");

    expect(wrapper.text()).not.toContain("Vue");
  });

  it("ajoute un lien personnalisé", async () => {
    const wrapper = await mountComponent();

    const inputs = wrapper.findAll(".two-inputs input");

    await inputs[0].setValue("Github");
    await inputs[1].setValue("https://github.com");

    await wrapper
      .find(".two-inputs button")
      .trigger("click");

    expect(wrapper.text()).toContain("Github");
  });

  it("sauvegarde le projet", async () => {
    const wrapper = await mountComponent();

    updateStudentProject.mockResolvedValue({});
    uploadStudentProjectMedia.mockResolvedValue({});

    await wrapper
      .find(".secondary-action")
      .trigger("click");

    expect(updateStudentProject)
      .toHaveBeenCalled();

    expect(push)
      .toHaveBeenCalledWith("/student/projects/1");
  });

  it("affiche une erreur si la sauvegarde échoue", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const wrapper = await mountComponent();

    updateStudentProject.mockRejectedValueOnce({
      response: {
        data: {
          message: "Modification impossible",
        },
      },
    });

    await wrapper
      .find(".secondary-action")
      .trigger("click");
    await vi.dynamicImportSettled();

    expect(updateStudentProject)
      .toHaveBeenCalled();
    expect(push)
      .not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("soumet le projet", async () => {
    const wrapper = await mountComponent();

    updateStudentProject.mockResolvedValue({});
    uploadStudentProjectMedia.mockResolvedValue({});
    submitStudentProject.mockResolvedValue({});

    await wrapper
      .find(".primary-action")
      .trigger("click");

    expect(updateStudentProject)
      .toHaveBeenCalled();

    expect(submitStudentProject)
      .toHaveBeenCalledWith("1");
  });

  it("affiche une erreur si la soumission échoue", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const wrapper = await mountComponent();

    updateStudentProject.mockResolvedValue({});
    uploadStudentProjectMedia.mockResolvedValue({});
    submitStudentProject.mockRejectedValueOnce({
      response: {
        data: {
          message: "Soumission impossible",
        },
      },
    });

    await wrapper
      .find(".primary-action")
      .trigger("click");
    await vi.dynamicImportSettled();

    expect(updateStudentProject)
      .toHaveBeenCalled();
    expect(submitStudentProject)
      .toHaveBeenCalledWith("1");
    expect(push)
      .not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
