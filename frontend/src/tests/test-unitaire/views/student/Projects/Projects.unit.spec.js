import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import StudentProjects from "@/views/student/Projects/Projects.vue";

import {
  getStudentProjects,
  submitStudentProject,
} from "@/services/studentProjectsApis";

vi.mock("@/assets/styles/student-project.css", () => ({}));

vi.mock("@/services/studentProjectsApis", () => ({
  getStudentProjects: vi.fn(),
  submitStudentProject: vi.fn(),
}));

vi.mock("vue-router", () => ({
  RouterLink: {
    props: ["to"],
    template: "<a><slot /></a>",
  },
}));

const projectsMock = [
  {
    id: 1,
    title: "Portfolio Vue",
    description: "Application portfolio étudiant",
    type: "Module",
    validationStatus: "DRAFT",
    technologies: ["Vue", "Laravel"],
    validatorName: "Prof Ahmed",
    createdAt: "2025-05-10",
  },
  {
    id: 2,
    title: "Projet IA",
    description: "Classification avec machine learning",
    type: "Hackathon",
    validationStatus: "APPROVED",
    technologies: ["Python"],
    validatorName: "Prof Sara",
    createdAt: "2025-06-15",
  },
];

const mountComponent = async () => {
  getStudentProjects.mockResolvedValue({
    data: { data: projectsMock },
  });

  const wrapper = mount(StudentProjects);
  await vi.dynamicImportSettled();

  return wrapper;
};

describe("StudentProjects - Tests unitaires", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("affiche les projets récupérés depuis l'API", async () => {
    const wrapper = await mountComponent();

    expect(wrapper.text()).toContain("Portfolio Vue");
    expect(wrapper.text()).toContain("Projet IA");
  });

  it("filtre les projets par recherche", async () => {
    const wrapper = await mountComponent();

    const searchInput = wrapper.find(
      'input[placeholder="Rechercher un projet..."]',
    );

    await searchInput.setValue("portfolio");

    expect(wrapper.text()).toContain("Portfolio Vue");
    expect(wrapper.text()).not.toContain("Projet IA");
  });

  it("filtre les projets par type", async () => {
    const wrapper = await mountComponent();

    const selects = wrapper.findAll("select");

    await selects[0].setValue("Hackathon");

    expect(wrapper.text()).toContain("Projet IA");
    expect(wrapper.text()).not.toContain("Portfolio Vue");
  });

  it("filtre les projets par statut", async () => {
    const wrapper = await mountComponent();

    const selects = wrapper.findAll("select");

    await selects[1].setValue("APPROVED");

    expect(wrapper.text()).toContain("Projet IA");
    expect(wrapper.text()).not.toContain("Portfolio Vue");
  });

  it("soumet un projet brouillon valide", async () => {
    submitStudentProject.mockResolvedValue({});

    const wrapper = await mountComponent();

    const submitButton = wrapper.find(".project-submit-btn");

    await submitButton.trigger("click");
    await vi.dynamicImportSettled();

    expect(submitStudentProject).toHaveBeenCalledWith(1);
    expect(getStudentProjects).toHaveBeenCalledTimes(2);
  });
});
