import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import StageDetailsView from "@/views/student/stages/StageDetailsView.vue";
import { getStudentStageById } from "@/services/studentstageService";

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

const pushMock = vi.fn();

vi.mock("vue-router", () => ({
  useRoute: () => ({ params: { id: "1" } }),
  useRouter: () => ({ push: pushMock }),
}));

const flushPromises = () => new Promise((resolve) => setTimeout(resolve));

const mockStage = {
  id: 1,
  title: "Stage PFE",
  company: "Orange",
  description: "Description complète du stage",
  duration: "2 mois",
  startDate: "2025-04-01",
  endDate: "2025-06-01",
  visibility: "PUBLIC",
  validationStatus: "DRAFT",
  technologies: ["Vue", "Laravel"],
  missions: ["Développement frontend", "Tests unitaires"],
  images: [],
  reportUrl: "",
  supervisor: {
    fullName: "Mme Salma",
    department: "Informatique",
  },
  validationHistory: [],
};

describe("StageDetailsView - UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getStudentStageById.mockResolvedValue({
      data: { data: mockStage },
    });
  });

  it("affiche les informations principales du stage", async () => {
    const wrapper = mount(StageDetailsView);

    await flushPromises();

    expect(wrapper.text()).toContain("Stage PFE");
    expect(wrapper.text()).toContain("Orange");
    expect(wrapper.text()).toContain("Description complète du stage");
    expect(wrapper.text()).toContain("2 mois");
  });

  it("affiche les sections importantes", async () => {
    const wrapper = mount(StageDetailsView);

    await flushPromises();

    expect(wrapper.text()).toContain("Description complète");
    expect(wrapper.text()).toContain("Technologies");
    expect(wrapper.text()).toContain("Captures d’écran");
    expect(wrapper.text()).toContain("Missions réalisées");
    expect(wrapper.text()).toContain("Historique de validation");
    expect(wrapper.text()).toContain("Informations générales");
    expect(wrapper.text()).toContain("Encadrant");
    expect(wrapper.text()).toContain("Rapport PDF");
  });

  it("affiche les technologies et missions", async () => {
    const wrapper = mount(StageDetailsView);

    await flushPromises();

    expect(wrapper.text()).toContain("Vue");
    expect(wrapper.text()).toContain("Laravel");
    expect(wrapper.text()).toContain("Développement frontend");
    expect(wrapper.text()).toContain("Tests unitaires");
  });

  it("affiche le bouton Modifier si le stage est modifiable", async () => {
    const wrapper = mount(StageDetailsView);

    await flushPromises();

    expect(wrapper.text()).toContain("Modifier");
  });

  it("n'affiche pas Modifier si le stage est validé", async () => {
    getStudentStageById.mockResolvedValueOnce({
      data: {
        data: {
          ...mockStage,
          validationStatus: "APPROVED",
        },
      },
    });

    const wrapper = mount(StageDetailsView);

    await flushPromises();

    expect(wrapper.text()).not.toContain("Modifier");
  });

  it("affiche message vide si aucune image", async () => {
    const wrapper = mount(StageDetailsView);

    await flushPromises();

    expect(wrapper.text()).toContain(
      "Aucune capture d’écran ajoutée pour ce stage."
    );
  });

  it("affiche le bouton voir toutes les images si plus de 4 images", async () => {
    getStudentStageById.mockResolvedValueOnce({
      data: {
        data: {
          ...mockStage,
          images: [
            { id: 1, title: "Image 1", url: "/1.png" },
            { id: 2, title: "Image 2", url: "/2.png" },
            { id: 3, title: "Image 3", url: "/3.png" },
            { id: 4, title: "Image 4", url: "/4.png" },
            { id: 5, title: "Image 5", url: "/5.png" },
          ],
        },
      },
    });

    const wrapper = mount(StageDetailsView);

    await flushPromises();

    expect(wrapper.text()).toContain("Voir toutes les images");
  });
});