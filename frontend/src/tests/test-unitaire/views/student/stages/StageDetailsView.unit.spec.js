import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import StageDetailsView from "@/views/student/stages/StageDetailsView.vue";
import { getStudentStageById } from "@/services/studentstageService";

const pushMock = vi.fn();

vi.mock("@/components/student/stages/StageImagesModal.vue", () => ({
  default: { template: "<div class='modal'>Modal images</div>" },
}));

vi.mock("@/services/studentstageService", () => ({
  getStudentStageById: vi.fn(),
  getStudentStageImageContent: vi.fn(),
  downloadStudentStageReport: vi.fn(),
}));

vi.mock("@/services/backendUrl", () => ({
  buildBackendUrl: (url) => url,
}));

vi.mock("vue-router", () => ({
  useRoute: () => ({ params: { id: "1" } }),
  useRouter: () => ({ push: pushMock }),
}));

const flushPromises = () => new Promise((resolve) => setTimeout(resolve));

const baseStage = {
  id: 1,
  title: "Stage Test",
  company: "Maroc Telecom",
  description: "Description",
  duration: "1 mois",
  startDate: "2025-01-10",
  endDate: "2025-02-10",
  visibility: "PRIVATE",
  validationStatus: "CORRECTION_REQUIRED",
  technologies: [],
  missions: [],
  images: [],
  reportUrl: "",
  supervisor: {
    fullName: "M. Ahmed",
    department: "Informatique",
  },
  validationHistory: [
    {
      id: 1,
      status: "PENDING",
      comment: "Stage soumis",
      actorName: "Ghizlane",
      createdAt: "2025-01-11",
    },
    {
      id: 2,
      status: "APPROVED",
      comment: "Stage validé",
      actorRole: "Encadrant",
      createdAt: "2025-01-15",
    },
  ],
};

describe("StageDetailsView - Unit", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getStudentStageById.mockResolvedValue({
      data: { data: baseStage },
    });
  });

  it("normalise CORRECTION_REQUIRED vers CHANGES_REQUESTED", async () => {
    const wrapper = mount(StageDetailsView);

    await flushPromises();

    const status = wrapper.find(".status-info");

    expect(status.classes()).toContain("CHANGES_REQUESTED");
    expect(wrapper.text()).toContain("Correction demandée");
  });

  it("affiche le statut Validé par l'encadrant si APPROVED", async () => {
    getStudentStageById.mockResolvedValueOnce({
      data: {
        data: {
          ...baseStage,
          validationStatus: "APPROVED",
        },
      },
    });

    const wrapper = mount(StageDetailsView);

    await flushPromises();

    expect(wrapper.text()).toContain("Validé par M. Ahmed");
  });

  it("affiche Brouillon si le statut est DRAFT", async () => {
    getStudentStageById.mockResolvedValueOnce({
      data: {
        data: {
          ...baseStage,
          validationStatus: "DRAFT",
        },
      },
    });

    const wrapper = mount(StageDetailsView);

    await flushPromises();

    expect(wrapper.text()).toContain("Brouillon");
  });

  it("affiche les dates au format yyyy-mm-dd", async () => {
    const wrapper = mount(StageDetailsView);

    await flushPromises();

    expect(wrapper.text()).toContain("2025-01-10");
    expect(wrapper.text()).toContain("2025-02-10");
  });

  it("affiche la visibilité privée", async () => {
    const wrapper = mount(StageDetailsView);

    await flushPromises();

    expect(wrapper.text()).toContain("Privée");
  });

  it("navigue vers la liste des stages au clic sur Retour", async () => {
    const wrapper = mount(StageDetailsView);

    await flushPromises();

    await wrapper.find(".back-btn").trigger("click");

    expect(pushMock).toHaveBeenCalledWith("/student/stages");
  });

  it("navigue vers la page modification au clic sur Modifier", async () => {
    const wrapper = mount(StageDetailsView);

    await flushPromises();

    await wrapper.find(".edit-btn").trigger("click");

    expect(pushMock).toHaveBeenCalledWith("/student/stages/1/edit");
  });

  it("affiche l'historique de validation", async () => {
    const wrapper = mount(StageDetailsView);

    await flushPromises();

    expect(wrapper.text()).toContain("Stage soumis");
    expect(wrapper.text()).toContain("Stage validé");
    expect(wrapper.text()).toContain("Ghizlane");
    expect(wrapper.text()).toContain("Encadrant");
  });
});