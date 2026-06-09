import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import StageFormPage from "@/views/student/stages/StageFormView.vue";
import {
  getStudentStageById,
  getStudentValidators,
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
    template: "<div class='stage-form'>StageForm</div>",
  },
}));

const flushPromises = () => new Promise((resolve) => setTimeout(resolve));

describe("StageFormPage - UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    routeParams = {};

    getStudentValidators.mockResolvedValue({
      data: { data: [{ id: 1, fullName: "Mme Salma" }] },
    });

    getStudentStageById.mockResolvedValue({
      data: {
        data: {
          id: 1,
          title: "Stage Test",
        },
      },
    });
  });

  it("affiche la page ajout stage en mode création", async () => {
    const wrapper = mount(StageFormPage);

    await flushPromises();

    expect(wrapper.text()).toContain("Ajouter un stage");
    expect(wrapper.text()).toContain("Enregistrez les informations de votre stage");
    expect(wrapper.find(".stage-form").exists()).toBe(true);
  });

  it("affiche la page modification stage en mode édition", async () => {
    routeParams = { id: "1" };

    const wrapper = mount(StageFormPage);

    await flushPromises();

    expect(wrapper.text()).toContain("Modifier le stage");
    expect(wrapper.text()).toContain("Mettez à jour les informations de votre stage");
    expect(getStudentStageById).toHaveBeenCalledWith("1");
  });

  it("affiche le loading au début", () => {
    const wrapper = mount(StageFormPage);

    expect(wrapper.text()).toContain("Chargement du stage...");
  });

  it("affiche le composant StageForm après chargement", async () => {
    const wrapper = mount(StageFormPage);

    await flushPromises();

    expect(wrapper.find(".stage-form").exists()).toBe(true);
  });

  it("retourne vers la liste des stages au clic sur retour", async () => {
    const wrapper = mount(StageFormPage);

    await flushPromises();

    await wrapper.find(".back-btn").trigger("click");

    expect(pushMock).toHaveBeenCalledWith("/student/stages");
  });
});