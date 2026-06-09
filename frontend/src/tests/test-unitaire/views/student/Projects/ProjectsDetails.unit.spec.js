import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import ProjectDetailsView from "@/views/student/Projects/ProjectsDetails.vue";
import {
  getStudentProjectById,
  deleteStudentProject,
} from "@/services/studentProjectsApis";

const pushMock = vi.fn();

vi.mock("@/services/studentProjectsApis", () => ({
  getStudentProjectById: vi.fn(),
  deleteStudentProject: vi.fn(),
}));

vi.mock("@/services/api", () => ({
  default: { get: vi.fn() },
}));

vi.mock("vue-router", () => ({
  useRoute: () => ({ params: { id: "1" } }),
  useRouter: () => ({ push: pushMock }),
  RouterLink: {
    props: ["to"],
    template: "<a><slot /></a>",
  },
}));

const flushPromises = () => new Promise((resolve) => setTimeout(resolve));

const baseProject = {
  id: 1,
  title: "Projet Test",
  type: "Module",
  description: "Description",
  role: "",
  teamSize: "",
  technologies: ["Vue"],
  validationStatus: "DRAFT",
  validatorName: "",
  validationComment: "",
  attachments: [],
  screenshots: [],
  validationHistory: [
    {
      id: 1,
      title: "Ancien",
      comment: "Ancien commentaire",
      actorName: "Admin",
      actorRole: "Validateur",
      createdAt: "2025-01-01",
    },
    {
      id: 2,
      title: "Récent",
      comment: "Nouveau commentaire",
      actorName: "Admin",
      actorRole: "Validateur",
      createdAt: "2025-06-01",
    },
  ],
  createdAt: "2025-05-10",
};

describe("ProjectDetailsView - Unit", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    global.confirm = vi.fn(() => true);

    getStudentProjectById.mockResolvedValue({
      data: { data: baseProject },
    });

    deleteStudentProject.mockResolvedValue({});
  });

  it("affiche le bon message pour un projet brouillon", async () => {
    const wrapper = mount(ProjectDetailsView);

    await flushPromises();

    expect(wrapper.text()).toContain("Projet en brouillon");
    expect(wrapper.text()).toContain(
      "Vous pouvez encore modifier ce projet avant de le soumettre"
    );
  });

  it("affiche le bon message pour un projet validé", async () => {
    getStudentProjectById.mockResolvedValueOnce({
      data: {
        data: {
          ...baseProject,
          validationStatus: "APPROVED",
          validatorName: "Mme Salma",
        },
      },
    });

    const wrapper = mount(ProjectDetailsView);

    await flushPromises();

    expect(wrapper.text()).toContain("Projet validé");
    expect(wrapper.text()).toContain("Validé par");
    expect(wrapper.text()).toContain("Mme Salma");
  });

  it("affiche le bon message pour corrections demandées", async () => {
    getStudentProjectById.mockResolvedValueOnce({
      data: {
        data: {
          ...baseProject,
          validationStatus: "CHANGES_REQUESTED",
          validatorName: "M. Ahmed",
        },
      },
    });

    const wrapper = mount(ProjectDetailsView);

    await flushPromises();

    expect(wrapper.text()).toContain("Corrections demandées");
    expect(wrapper.text()).toContain("M. Ahmed");
  });

  it("trie l'historique de validation du plus récent au plus ancien", async () => {
    const wrapper = mount(ProjectDetailsView);

    await flushPromises();

    const text = wrapper.text();

    expect(text.indexOf("Récent")).toBeLessThan(text.indexOf("Ancien"));
  });

  it("affiche la date formatée", async () => {
    const wrapper = mount(ProjectDetailsView);

    await flushPromises();

    expect(wrapper.text()).toContain("10 mai 2025");
  });

  it("supprime le projet si l'utilisateur confirme", async () => {
    const wrapper = mount(ProjectDetailsView);

    await flushPromises();

    const deleteButton = wrapper.find(".delete-project-button");
    await deleteButton.trigger("click");

    expect(global.confirm).toHaveBeenCalled();
    expect(deleteStudentProject).toHaveBeenCalledWith("1");
    expect(pushMock).toHaveBeenCalledWith("/student/projects");
  });

  it("ne supprime pas le projet si l'utilisateur annule", async () => {
    global.confirm = vi.fn(() => false);

    const wrapper = mount(ProjectDetailsView);

    await flushPromises();

    const deleteButton = wrapper.find(".delete-project-button");
    await deleteButton.trigger("click");

    expect(deleteStudentProject).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
