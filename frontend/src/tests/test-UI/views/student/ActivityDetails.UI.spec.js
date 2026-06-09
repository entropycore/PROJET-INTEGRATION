import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import ActivityDetailsPage from "@/views/student/ActivityDetails.vue";
import { getStudentActivityById } from "@/services/studentActivitiesService";

const pushMock = vi.fn();

vi.mock("vue-router", () => ({
  useRoute: () => ({ params: { id: "1" } }),
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/services/backendUrl", () => ({
  buildBackendUrl: (url) => url,
}));

vi.mock("@/components/student/activities/activityRules", () => ({
  canEditActivity: vi.fn(() => true),
  canDeleteActivity: vi.fn(() => true),
  canSubmitActivity: vi.fn(() => true),
  hasActivityCertificate: vi.fn(() => true),
}));

vi.mock("@/services/studentActivitiesService", () => ({
  getStudentActivityById: vi.fn(),
  deleteStudentActivity: vi.fn(),
  downloadStudentActivityCertificate: vi.fn(),
  submitStudentActivityValidation: vi.fn(),
}));

const flushPromises = () => new Promise((resolve) => setTimeout(resolve));

const activityMock = {
  id: 1,
  title: "Club Robotique",
  type: "CLUB",
  organization: "ENSA",
  duration: "2 mois",
  location: "Tanger",
  description: "Participation au club robotique",
  validationStatus: "DRAFT",
  certificateName: "attestation.pdf",
  certificateUrl: "/attestation.pdf",
  certificateType: "pdf",
  date: "2025-01-10",
  createdAt: "2025-01-01",
  screenshots: [],
  validationHistory: [],
};

describe("ActivityDetailsPage - UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getStudentActivityById.mockResolvedValue({
      data: { data: activityMock },
    });
  });

  it("affiche les informations principales", async () => {
    const wrapper = mount(ActivityDetailsPage);

    await flushPromises();

    expect(wrapper.text()).toContain("Club Robotique");
    expect(wrapper.text()).toContain("Club");
    expect(wrapper.text()).toContain("ENSA");
    expect(wrapper.text()).toContain("Participation au club robotique");
  });

  it("affiche les sections importantes", async () => {
    const wrapper = mount(ActivityDetailsPage);

    await flushPromises();

    expect(wrapper.text()).toContain("À propos de l’activité");
    expect(wrapper.text()).toContain("Attestation");
    expect(wrapper.text()).toContain("Captures / médias de l’activité");
    expect(wrapper.text()).toContain("Historique de validation");
    expect(wrapper.text()).toContain("Validation");
    expect(wrapper.text()).toContain("Informations");
  });

  it("affiche les boutons importants", async () => {
    const wrapper = mount(ActivityDetailsPage);

    await flushPromises();

    expect(wrapper.text()).toContain("Modifier");
    expect(wrapper.text()).toContain("Soumettre");
    expect(wrapper.text()).toContain("Supprimer l’activité");
  });

  it("affiche l'attestation si elle existe", async () => {
    const wrapper = mount(ActivityDetailsPage);

    await flushPromises();

    expect(wrapper.text()).toContain("attestation.pdf");
    expect(wrapper.text()).toContain("Document PDF");
    expect(wrapper.text()).toContain("Prévisualiser");
    expect(wrapper.text()).toContain("Télécharger");
  });

  it("affiche message si aucune attestation", async () => {
    getStudentActivityById.mockResolvedValueOnce({
      data: {
        data: {
          ...activityMock,
          certificateName: "",
          certificateUrl: "",
        },
      },
    });

    const wrapper = mount(ActivityDetailsPage);

    await flushPromises();

    expect(wrapper.text()).toContain(
      "Aucune attestation ajoutée pour cette activité."
    );
  });

  it("retourne vers la liste des activités", async () => {
    const wrapper = mount(ActivityDetailsPage);

    await flushPromises();

    await wrapper.find(".back-link").trigger("click");

    expect(pushMock).toHaveBeenCalledWith("/student/activities");
  });
});
