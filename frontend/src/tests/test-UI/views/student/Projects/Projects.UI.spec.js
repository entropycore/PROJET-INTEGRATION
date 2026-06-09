import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import StudentProjects from "@/views/student/Projects/Projects.vue";
import { getStudentProjects } from "@/services/studentProjectsApis";

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
];

const mountComponent = async () => {
  getStudentProjects.mockResolvedValue({
    data: { data: projectsMock },
  });

  const wrapper = mount(StudentProjects);
  await vi.dynamicImportSettled();

  return wrapper;
};

describe("StudentProjects - Tests UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("affiche la structure principale de la page", async () => {
    const wrapper = await mountComponent();

    expect(wrapper.find(".student-projects-page").exists()).toBe(true);
    expect(wrapper.find(".page-header").exists()).toBe(true);
    expect(wrapper.find(".projects-card").exists()).toBe(true);
    expect(wrapper.find(".projects-toolbar").exists()).toBe(true);
  });

  it("affiche la barre de recherche et les filtres", async () => {
    const wrapper = await mountComponent();

    expect(wrapper.find(".projects-search").exists()).toBe(true);
    expect(wrapper.findAll("select")).toHaveLength(2);
    expect(wrapper.text()).toContain("Tous les types");
    expect(wrapper.text()).toContain("Tous les statuts");
  });

  it("affiche une carte projet avec ses éléments UI", async () => {
    const wrapper = await mountComponent();

    expect(wrapper.find(".project-card").exists()).toBe(true);
    expect(wrapper.find(".project-type-pill").exists()).toBe(true);
    expect(wrapper.find(".project-status-pill").exists()).toBe(true);
    expect(wrapper.find(".project-tech-pill").exists()).toBe(true);
  });

  it("affiche le bouton nouveau projet", async () => {
    const wrapper = await mountComponent();

    expect(wrapper.text()).toContain("Nouveau projet");
    expect(wrapper.find(".projects-create-btn").exists()).toBe(true);
  });

  it("affiche le message aucun projet si la liste est vide", async () => {
    getStudentProjects.mockResolvedValue({
      data: { data: [] },
    });

    const wrapper = mount(StudentProjects);
    await vi.dynamicImportSettled();

    expect(wrapper.text()).toContain("Aucun projet trouvé.");
  });
});
