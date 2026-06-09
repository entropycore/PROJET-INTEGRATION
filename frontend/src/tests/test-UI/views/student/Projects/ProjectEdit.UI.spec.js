import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import ProjectEdit from "@/views/student/projects/ProjectEdit.vue";

import {
  getStudentProjectById,
  getStudentProjectValidators,
} from "@/services/studentProjectsApis";

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
    push: vi.fn(),
  }),
  RouterLink: {
    template: "<a><slot /></a>",
  },
}));

const projectMock = {
  id: 1,
  title: "Projet Portfolio",
  type: "Module",
  description: "Description",
  validatorId: "",
  validatorName: "",
  technologies: [],
  extraLinks: [],
  screenshots: [],
  attachments: [],
};

beforeEach(() => {
  getStudentProjectById.mockResolvedValue({
    data: { data: projectMock },
  });

  getStudentProjectValidators.mockResolvedValue({
    data: { data: [] },
  });
});

describe("ProjectEdit UI Tests", () => {
  it("affiche le layout principal", async () => {
    const wrapper = mount(ProjectEdit);

    await vi.dynamicImportSettled();

    expect(
      wrapper.find(".project-edit-page").exists(),
    ).toBe(true);

    expect(
      wrapper.find(".edit-header").exists(),
    ).toBe(true);

    expect(
      wrapper.find(".edit-layout").exists(),
    ).toBe(true);
  });

  it("affiche les sections importantes", async () => {
    const wrapper = mount(ProjectEdit);

    await vi.dynamicImportSettled();

    expect(wrapper.text())
      .toContain("Informations principales");

    expect(wrapper.text())
      .toContain("Technologies utilisées");

    expect(wrapper.text())
      .toContain("Liens du projet");

    expect(wrapper.text())
      .toContain("Captures d’écran");

    expect(wrapper.text())
      .toContain("Pièces jointes");
  });

  it("affiche les boutons principaux", async () => {
    const wrapper = mount(ProjectEdit);

    await vi.dynamicImportSettled();

    expect(wrapper.text())
      .toContain("Enregistrer");

    expect(wrapper.text())
      .toContain("Soumettre");
  });

  it("affiche le warning si aucun validateur", async () => {
    const wrapper = mount(ProjectEdit);

    await vi.dynamicImportSettled();

    expect(
      wrapper.find(".edit-warning-card").exists(),
    ).toBe(true);
  });
});