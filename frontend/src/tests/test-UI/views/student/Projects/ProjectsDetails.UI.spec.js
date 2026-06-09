import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import ProjectDetailsView from "@/views/student/Projects/ProjectsDetails.vue";
import { getStudentProjectById } from "@/services/studentProjectsApis";

vi.mock("@/services/studentProjectsApis", () => ({
  getStudentProjectById: vi.fn(),
  deleteStudentProject: vi.fn(),
}));

vi.mock("@/services/api", () => ({
  default: { get: vi.fn() },
}));

vi.mock("vue-router", () => ({
  useRoute: () => ({ params: { id: "1" } }),
  useRouter: () => ({ push: vi.fn() }),
  RouterLink: {
    props: ["to"],
    template: "<a><slot /></a>",
  },
}));

const flushPromises = () => new Promise((resolve) => setTimeout(resolve));

const mockProject = {
  id: 1,
  title: "Projet Portfolio",
  type: "Stage",
  description: "Description complète du projet",
  role: "Développeuse Frontend",
  teamSize: 3,
  technologies: ["Vue", "Spring Boot"],
  validationStatus: "DRAFT",
  validatorName: "Mme Salma",
  validationComment: "Bon travail",
  githubUrl: "https://github.com/test",
  demoUrl: "https://demo.com",
  documentationUrl: "https://docs.com",
  attachments: [],
  screenshots: [],
  validationHistory: [],
  createdAt: "2025-05-10",
};

describe("ProjectDetailsView - UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getStudentProjectById.mockResolvedValue({
      data: { data: mockProject },
    });
  });

  it("affiche les informations principales du projet", async () => {
    const wrapper = mount(ProjectDetailsView);

    await flushPromises();

    expect(wrapper.text()).toContain("Projet Portfolio");
    expect(wrapper.text()).toContain("Stage");
    expect(wrapper.text()).toContain("Description complète du projet");
    expect(wrapper.text()).toContain("Développeuse Frontend");
    expect(wrapper.text()).toContain("3");
  });

  it("affiche les sections importantes de la page", async () => {
    const wrapper = mount(ProjectDetailsView);

    await flushPromises();

    expect(wrapper.text()).toContain("À propos du projet");
    expect(wrapper.text()).toContain("Technologies utilisées");
    expect(wrapper.text()).toContain("Liens du projet");
    expect(wrapper.text()).toContain("Pièces jointes");
    expect(wrapper.text()).toContain("Historique de validation");
    expect(wrapper.text()).toContain("Validation");
    expect(wrapper.text()).toContain("Informations");
  });

  it("affiche les technologies utilisées", async () => {
    const wrapper = mount(ProjectDetailsView);

    await flushPromises();

    expect(wrapper.text()).toContain("Vue");
    expect(wrapper.text()).toContain("Spring Boot");
  });

  it("affiche le bouton Modifier si le projet est modifiable", async () => {
    const wrapper = mount(ProjectDetailsView);

    await flushPromises();

    expect(wrapper.text()).toContain("Modifier");
  });

  it("n'affiche pas Modifier si le projet est en attente", async () => {
    getStudentProjectById.mockResolvedValueOnce({
      data: {
        data: {
          ...mockProject,
          validationStatus: "PENDING",
        },
      },
    });

    const wrapper = mount(ProjectDetailsView);

    await flushPromises();

    expect(wrapper.text()).not.toContain("Modifier");
  });

  it("affiche le message vide quand aucun fichier n'est ajouté", async () => {
    const wrapper = mount(ProjectDetailsView);

    await flushPromises();

    expect(wrapper.text()).toContain("Aucune pièce jointe ajoutée.");
    expect(wrapper.text()).toContain("Aucun historique de validation disponible.");
  });

  it("affiche les liens du projet", async () => {
    const wrapper = mount(ProjectDetailsView);

    await flushPromises();

    expect(wrapper.text()).toContain("GitHub Repository");
    expect(wrapper.text()).toContain("Demo du projet");
    expect(wrapper.text()).toContain("Documentation");
  });
});
