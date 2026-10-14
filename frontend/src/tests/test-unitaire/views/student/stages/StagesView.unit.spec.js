import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import StudentStages from "@/views/student/stages/StagesView.vue";
import {
  getStudentStages,
  deleteStudentStage,
  submitStudentStageValidation,
} from "@/services/studentstageService";

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
    template: `
      <div class="stage-filters">
        <button class="search-vue" @click="$emit('update:search', 'vue')">search</button>
        <button class="filter-approved" @click="$emit('update:status', 'APPROVED')">status</button>
        <button class="filter-changes-requested" @click="$emit('update:status', 'CHANGES_REQUESTED')">changes</button>
        <button class="filter-public" @click="$emit('update:visibility', 'PUBLIC')">visibility</button>
      </div>
    `,
  },
}));

vi.mock("@/components/student/stages/StageCard.vue", () => ({
  default: {
    props: ["stage"],
    emits: ["delete-stage", "submit-validation"],
    template: `
      <div class="stage-card">
        <span>{{ stage.title }}</span>
        <button class="delete" @click="$emit('delete-stage', stage.id)">delete</button>
        <button class="submit" @click="$emit('submit-validation', stage.id)">submit</button>
      </div>
    `,
  },
}));

const flushPromises = () => new Promise((resolve) => setTimeout(resolve));

const stagesMock = [
  {
    id: 1,
    title: "Stage Vue",
    company: "Orange",
    validationStatus: "DRAFT",
    visibility: "PRIVATE",
    technologies: ["Vue"],
  },
  {
    id: 2,
    title: "Stage Spring",
    company: "Maroc Telecom",
    validationStatus: "APPROVED",
    visibility: "PUBLIC",
    technologies: ["Spring"],
  },
  {
    id: 3,
    title: "Stage React",
    company: "Inwi",
    validationStatus: "CORRECTION_REQUIRED",
    visibility: "PRIVATE",
    technologies: ["React"],
  },
];

describe("StudentStages - Unit", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    window.confirm = vi.fn(() => true);

    getStudentStages.mockResolvedValue({
      data: { data: stagesMock },
    });

    deleteStudentStage.mockResolvedValue({});
    submitStudentStageValidation.mockResolvedValue({});
  });

  it("filtre les stages par recherche", async () => {
    const wrapper = mount(StudentStages);

    await flushPromises();

    await wrapper.find(".search-vue").trigger("click");

    expect(wrapper.text()).toContain("Stage Vue");
    expect(wrapper.text()).not.toContain("Stage Spring");
  });

  it("affiche un état vide si aucun stage n'est retourné", async () => {
    getStudentStages.mockResolvedValueOnce({
      data: { data: [] },
    });

    const wrapper = mount(StudentStages);

    await flushPromises();

    expect(wrapper.text()).toContain("Aucun stage trouvé");
    expect(wrapper.text()).toContain("0 stages");
    expect(wrapper.find(".stage-card").exists()).toBe(false);
  });

  it("capture l'erreur si le chargement des stages échoue", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    getStudentStages.mockRejectedValueOnce(new Error("API down"));

    const wrapper = mount(StudentStages);

    await flushPromises();

    expect(wrapper.text()).toContain("Aucun stage trouvé");
    expect(wrapper.text()).toContain("0 stages");
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("filtre les stages par statut", async () => {
    const wrapper = mount(StudentStages);

    await flushPromises();

    await wrapper.find(".filter-approved").trigger("click");

    expect(wrapper.text()).toContain("Stage Spring");
    expect(wrapper.text()).not.toContain("Stage Vue");
  });

  it("filtre les stages par visibilité", async () => {
    const wrapper = mount(StudentStages);

    await flushPromises();

    await wrapper.find(".filter-public").trigger("click");

    expect(wrapper.text()).toContain("Stage Spring");
    expect(wrapper.text()).not.toContain("Stage Vue");
  });

  it("normalise CORRECTION_REQUIRED vers CHANGES_REQUESTED", async () => {
    const wrapper = mount(StudentStages);

    await flushPromises();

    await wrapper.find(".filter-changes-requested").trigger("click");

    expect(wrapper.text()).toContain("Stage React");
    expect(wrapper.text()).not.toContain("Stage Vue");
  });

  it("supprime un stage après confirmation", async () => {
    const wrapper = mount(StudentStages);

    await flushPromises();

    await wrapper.find(".delete").trigger("click");
    await flushPromises();

    expect(window.confirm).toHaveBeenCalled();
    expect(deleteStudentStage).toHaveBeenCalledWith(1);
    expect(getStudentStages).toHaveBeenCalledTimes(2);
  });

  it("ne supprime pas si l'utilisateur annule", async () => {
    window.confirm = vi.fn(() => false);

    const wrapper = mount(StudentStages);

    await flushPromises();

    await wrapper.find(".delete").trigger("click");
    await flushPromises();

    expect(deleteStudentStage).not.toHaveBeenCalled();
  });

  it("capture l'erreur si la suppression du stage échoue", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    deleteStudentStage.mockRejectedValueOnce(new Error("Delete failed"));

    const wrapper = mount(StudentStages);

    await flushPromises();

    await wrapper.find(".delete").trigger("click");
    await flushPromises();

    expect(deleteStudentStage).toHaveBeenCalledWith(1);
    expect(getStudentStages).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("soumet un stage à la validation", async () => {
    const wrapper = mount(StudentStages);

    await flushPromises();

    await wrapper.find(".submit").trigger("click");
    await flushPromises();

    expect(submitStudentStageValidation).toHaveBeenCalledWith(1);
    expect(getStudentStages).toHaveBeenCalledTimes(2);
  });

  it("capture l'erreur si la soumission du stage échoue", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    submitStudentStageValidation.mockRejectedValueOnce(
      new Error("Submit failed")
    );

    const wrapper = mount(StudentStages);

    await flushPromises();

    await wrapper.find(".submit").trigger("click");
    await flushPromises();

    expect(submitStudentStageValidation).toHaveBeenCalledWith(1);
    expect(getStudentStages).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
