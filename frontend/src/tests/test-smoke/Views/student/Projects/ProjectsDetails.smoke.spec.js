import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import ProjectDetailsView from "@/views/student/Projects/ProjectsDetails.vue";
import { getStudentProjectById } from "@/services/studentProjectsApis";

vi.mock("@/services/studentProjectsApis", () => ({
  getStudentProjectById: vi.fn(),
  deleteStudentProject: vi.fn(),
}));

vi.mock("@/services/api", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("vue-router", () => ({
  useRoute: () => ({
    params: { id: 1 },
  }),
  useRouter: () => ({
    push: vi.fn(),
  }),
  RouterLink: {
    template: "<a><slot /></a>",
  },
}));

describe("ProjectDetailsView - Smoke Test", () => {
  beforeEach(() => {
    getStudentProjectById.mockResolvedValue({
      data: {
        data: {
          id: 1,
          title: "Projet Test",
          type: "Stage",
          description: "Description projet",
          technologies: ["Vue", "Spring"],
          validationStatus: "DRAFT",
          attachments: [],
          screenshots: [],
          validationHistory: [],
        },
      },
    });
  });

  it("monte la page sans erreur", async () => {
    const wrapper = mount(ProjectDetailsView);

    await new Promise((resolve) => setTimeout(resolve));

    expect(wrapper.exists()).toBe(true);
  });

  it("affiche les sections principales", async () => {
    const wrapper = mount(ProjectDetailsView);

    await new Promise((resolve) => setTimeout(resolve));

    expect(wrapper.text()).toContain("À propos du projet");
    expect(wrapper.text()).toContain("Technologies utilisées");
    expect(wrapper.text()).toContain("Validation");
    expect(wrapper.text()).toContain("Informations");
  });
});
