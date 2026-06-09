import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import StudentStages from "@/views/student/stages/StagesView.vue";
import { getStudentStages } from "@/services/studentstageService";

const pushMock = vi.fn();

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/services/studentstageService", () => ({
  getStudentStages: vi.fn(),
  deleteStudentStage: vi.fn(),
  submitStudentStageValidation: vi.fn(),
}));

vi.mock("@/components/student/stages/StageFilters.vue", () => ({
  default: {
    props: ["search", "status", "visibility"],
    emits: ["update:search", "update:status", "update:visibility"],
    template: "<div class='stage-filters'>Filters</div>",
  },
}));

vi.mock("@/components/student/stages/StageCard.vue", () => ({
  default: {
    props: ["stage"],
    template: "<div class='stage-card'>{{ stage.title }} - {{ stage.company }}</div>",
  },
}));

const flushPromises = () => new Promise((resolve) => setTimeout(resolve));

const stagesMock = [
  {
    id: 1,
    title: "Stage Frontend",
    company: "Orange",
    validationStatus: "DRAFT",
    visibility: "PRIVATE",
    technologies: ["Vue"],
  },
  {
    id: 2,
    title: "Stage Backend",
    company: "Maroc Telecom",
    validationStatus: "APPROVED",
    visibility: "PUBLIC",
    technologies: ["Spring"],
  },
];

describe("StudentStages - UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getStudentStages.mockResolvedValue({
      data: { data: stagesMock },
    });
  });

  it("affiche le titre et le bouton ajouter", async () => {
    const wrapper = mount(StudentStages);

    await flushPromises();

    expect(wrapper.text()).toContain("Mes stages");
    expect(wrapper.text()).toContain("Faites valider vos expériences de stage");
    expect(wrapper.text()).toContain("Ajouter un stage");
  });

  it("affiche les filtres", async () => {
    const wrapper = mount(StudentStages);

    await flushPromises();

    expect(wrapper.find(".stage-filters").exists()).toBe(true);
  });

  it("affiche les stages récupérés", async () => {
    const wrapper = mount(StudentStages);

    await flushPromises();

    expect(wrapper.text()).toContain("Stage Frontend");
    expect(wrapper.text()).toContain("Orange");
    expect(wrapper.text()).toContain("Stage Backend");
    expect(wrapper.text()).toContain("Maroc Telecom");
  });

  it("affiche le nombre de stages", async () => {
    const wrapper = mount(StudentStages);

    await flushPromises();

    expect(wrapper.text()).toContain("2 stages");
  });

  it("affiche un message vide si aucun stage trouvé", async () => {
    getStudentStages.mockResolvedValueOnce({
      data: { data: [] },
    });

    const wrapper = mount(StudentStages);

    await flushPromises();

    expect(wrapper.text()).toContain("Aucun stage trouvé");
    expect(wrapper.text()).toContain(
      "Essayez de modifier les filtres ou ajoutez un nouveau stage."
    );
  });

  it("navigue vers la création d'un stage", async () => {
    const wrapper = mount(StudentStages);

    await flushPromises();

    await wrapper.find(".add-btn").trigger("click");

    expect(pushMock).toHaveBeenCalledWith("/student/stages/create");
  });
});