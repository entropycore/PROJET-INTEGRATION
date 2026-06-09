import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import StageFormPage from "@/views/student/stages/StageFormView.vue";
import {
  getStudentStageById,
  getStudentValidators,
  createStudentStage,
  updateStudentStage,
  submitStudentStageValidation,
  uploadStudentStageImages,
  uploadStudentStageReport,
  deleteStudentStageImage,
} from "@/services/studentstageService";

const pushMock = vi.fn();
let routeParams = {};

vi.mock("vue-router", () => ({
  useRoute: () => ({ params: routeParams }),
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/services/studentstageService", () => ({
  getStudentStageById: vi.fn(),
  getStudentValidators: vi.fn(),
  createStudentStage: vi.fn(),
  updateStudentStage: vi.fn(),
  submitStudentStageValidation: vi.fn(),
  uploadStudentStageImages: vi.fn(),
  uploadStudentStageReport: vi.fn(),
  deleteStudentStageImage: vi.fn(),
}));

vi.mock("@/components/student/stages/StageForm.vue", () => ({
  default: {
    props: ["initialStage", "validators"],
    emits: ["save-draft", "submit-validation", "delete-image"],
    template: `
      <div class="stage-form">
        <button class="save" @click="$emit('save-draft', mockPayload)">save</button>
        <button class="submit" @click="$emit('submit-validation', mockPayload)">submit</button>
        <button class="delete-image" @click="$emit('delete-image', 5)">delete</button>
      </div>
    `,
    data() {
      return {
        mockPayload: {
          title: "Stage Test",
          company: "Orange",
          duration: "2 mois",
          startDate: "2025-01-01",
          endDate: "2025-03-01",
          description: "Description",
          missions: ["Mission 1"],
          supervisor: 1,
          technologies: ["Vue"],
          report: new File(["test"], "rapport.pdf"),
          images: [new File(["img"], "image.png")],
        },
      };
    },
  },
}));

const flushPromises = () => new Promise((resolve) => setTimeout(resolve));

describe("StageFormPage - Unit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    routeParams = {};

    window.confirm = vi.fn(() => true);

    getStudentValidators.mockResolvedValue({
      data: { data: [{ id: 1, fullName: "Mme Salma" }] },
    });

    getStudentStageById.mockResolvedValue({
      data: {
        data: {
          id: 1,
          title: "Ancien stage",
          visibility: "PUBLIC",
        },
      },
    });

    createStudentStage.mockResolvedValue({
      data: { data: { id: 10 } },
    });

    updateStudentStage.mockResolvedValue({});
    uploadStudentStageReport.mockResolvedValue({});
    uploadStudentStageImages.mockResolvedValue({});
    submitStudentStageValidation.mockResolvedValue({});
    deleteStudentStageImage.mockResolvedValue({});
  });

  it("charge les validateurs au montage", async () => {
    mount(StageFormPage);

    await flushPromises();

    expect(getStudentValidators).toHaveBeenCalled();
  });

  it("crée un stage brouillon en mode création", async () => {
    const wrapper = mount(StageFormPage);

    await flushPromises();

    await wrapper.find(".save").trigger("click");
    await flushPromises();

    expect(createStudentStage).toHaveBeenCalled();
    expect(uploadStudentStageReport).toHaveBeenCalledWith(10, expect.any(File));
    expect(uploadStudentStageImages).toHaveBeenCalledWith(10, expect.any(Array));
    expect(pushMock).toHaveBeenCalledWith("/student/stages");
  });

  it("modifie un stage brouillon en mode édition", async () => {
    routeParams = { id: "1" };

    const wrapper = mount(StageFormPage);

    await flushPromises();

    await wrapper.find(".save").trigger("click");
    await flushPromises();

    expect(updateStudentStage).toHaveBeenCalledWith(
      "1",
      expect.objectContaining({
        title: "Stage Test",
        company: "Orange",
        visibility: "PUBLIC",
      })
    );

    expect(pushMock).toHaveBeenCalledWith("/student/stages");
  });

  it("crée puis soumet un stage à la validation", async () => {
    const wrapper = mount(StageFormPage);

    await flushPromises();

    await wrapper.find(".submit").trigger("click");
    await flushPromises();

    expect(createStudentStage).toHaveBeenCalled();
    expect(submitStudentStageValidation).toHaveBeenCalledWith(10);
    expect(pushMock).toHaveBeenCalledWith("/student/stages");
  });

  it("modifie puis soumet un stage à la validation en mode édition", async () => {
    routeParams = { id: "1" };

    const wrapper = mount(StageFormPage);

    await flushPromises();

    await wrapper.find(".submit").trigger("click");
    await flushPromises();

    expect(updateStudentStage).toHaveBeenCalled();
    expect(submitStudentStageValidation).toHaveBeenCalledWith("1");
  });

  it("supprime une image après confirmation", async () => {
    routeParams = { id: "1" };

    const wrapper = mount(StageFormPage);

    await flushPromises();

    await wrapper.find(".delete-image").trigger("click");
    await flushPromises();

    expect(window.confirm).toHaveBeenCalled();
    expect(deleteStudentStageImage).toHaveBeenCalledWith("1", 5);
    expect(getStudentStageById).toHaveBeenCalledWith("1");
  });

  it("ne supprime pas l'image si l'utilisateur annule", async () => {
    routeParams = { id: "1" };
    window.confirm = vi.fn(() => false);

    const wrapper = mount(StageFormPage);

    await flushPromises();

    await wrapper.find(".delete-image").trigger("click");
    await flushPromises();

    expect(deleteStudentStageImage).not.toHaveBeenCalled();
  });
});