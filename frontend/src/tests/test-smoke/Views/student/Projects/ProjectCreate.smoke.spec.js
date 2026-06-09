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

describe("ProjectCreate - Smoke", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getStudentProjectValidators.mockResolvedValue({
      data: {
        data: [{ id: 1, fullName: "Prof Test", email: "prof@test.com" }],
      },
    });
  });

  it("monte la page sans erreur", async () => {
    const wrapper = mount(ProjectCreate);
    await vi.dynamicImportSettled();

    expect(wrapper.text()).toContain("Nouveau projet");
    expect(wrapper.text()).toContain("Informations principales");
    expect(wrapper.text()).toContain("Créer et soumettre");
  });
});