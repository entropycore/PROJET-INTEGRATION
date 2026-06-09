import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import ActivityDetailsPage from "@/views/student/ActivityDetails.vue";
import {
  getStudentActivityById,
  deleteStudentActivity,
  submitStudentActivityValidation,
  downloadStudentActivityCertificate,
} from "@/services/studentActivitiesService";
import {
  canEditActivity,
  canDeleteActivity,
  canSubmitActivity,
  hasActivityCertificate,
} from "@/components/student/activities/activityRules";

const pushMock = vi.fn();

vi.mock("vue-router", () => ({
  useRoute: () => ({ params: { id: "1" } }),
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/services/backendUrl", () => ({
  buildBackendUrl: (url) => url,
}));

vi.mock("@/components/student/activities/activityRules", () => ({
  canEditActivity: vi.fn(),
  canDeleteActivity: vi.fn(),
  canSubmitActivity: vi.fn(),
  hasActivityCertificate: vi.fn(),
}));

vi.mock("@/services/studentActivitiesService", () => ({
  getStudentActivityById: vi.fn(),
  deleteStudentActivity: vi.fn(),
  downloadStudentActivityCertificate: vi.fn(),
  submitStudentActivityValidation: vi.fn(),
}));

const flushPromises = () => new Promise((resolve) => setTimeout(resolve));

const baseActivity = {
  id: 1,
  title: "Hackathon Orange",
  type: "COMPETITION",
  organization: "Orange",
  duration: "1 jour",
  location: "Casablanca",
  description: "Compétition tech",
  validationStatus: "DRAFT",
  certificateName: "certificat.pdf",
  certificateUrl: "/certificat.pdf",
  certificateType: "pdf",
  date: "2025-02-10",
  createdAt: "2025-02-01",
  validationHistory: [],
  screenshots: [],
};

describe("ActivityDetailsPage - Unit", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    window.confirm = vi.fn(() => true);
    global.URL.createObjectURL = vi.fn(() => "blob:test");
    global.URL.revokeObjectURL = vi.fn();

    canEditActivity.mockReturnValue(true);
    canDeleteActivity.mockReturnValue(true);
    canSubmitActivity.mockReturnValue(true);
    hasActivityCertificate.mockReturnValue(true);

    getStudentActivityById.mockResolvedValue({
      data: { data: baseActivity },
    });

    deleteStudentActivity.mockResolvedValue({});
    submitStudentActivityValidation.mockResolvedValue({
      data: {
        data: {
          ...baseActivity,
          validationStatus: "PENDING",
        },
      },
    });

    downloadStudentActivityCertificate.mockResolvedValue({
      data: new Blob(["pdf"], { type: "application/pdf" }),
      headers: { "content-type": "application/pdf" },
    });
  });

  it("affiche le bon message pour une activité brouillon", async () => {
    const wrapper = mount(ActivityDetailsPage);

    await flushPromises();

    expect(wrapper.text()).toContain("Activité en brouillon");
    expect(wrapper.text()).toContain("Brouillon non soumis");
  });

  it("affiche le bon message pour une activité validée", async () => {
    getStudentActivityById.mockResolvedValueOnce({
      data: {
        data: {
          ...baseActivity,
          validationStatus: "APPROVED",
        },
      },
    });

    const wrapper = mount(ActivityDetailsPage);

    await flushPromises();

    expect(wrapper.text()).toContain("Activité validée");
    expect(wrapper.text()).toContain("Validée par");
  });

  it("redirige vers la page modification", async () => {
    const wrapper = mount(ActivityDetailsPage);

    await flushPromises();

    await wrapper.find(".secondary-action").trigger("click");

    expect(pushMock).toHaveBeenCalledWith("/student/activities/1/edit");
  });

  it("supprime l'activité après confirmation", async () => {
    const wrapper = mount(ActivityDetailsPage);

    await flushPromises();

    await wrapper.find(".delete-project-button").trigger("click");
    await flushPromises();

    expect(window.confirm).toHaveBeenCalled();
    expect(deleteStudentActivity).toHaveBeenCalledWith(1);
    expect(pushMock).toHaveBeenCalledWith("/student/activities");
  });

  it("ne supprime pas si l'utilisateur annule", async () => {
    window.confirm = vi.fn(() => false);

    const wrapper = mount(ActivityDetailsPage);

    await flushPromises();

    await wrapper.find(".delete-project-button").trigger("click");

    expect(deleteStudentActivity).not.toHaveBeenCalled();
  });

  it("soumet l'activité à validation si elle est valide", async () => {
    const wrapper = mount(ActivityDetailsPage);

    await flushPromises();

    await wrapper.find(".validation-submit-btn").trigger("click");
    await flushPromises();

    expect(submitStudentActivityValidation).toHaveBeenCalledWith(1);
    expect(wrapper.text()).toContain("Activité soumise à validation.");
  });

  it("affiche message si activité sans attestation", async () => {
    canSubmitActivity.mockReturnValue(false);
    hasActivityCertificate.mockReturnValue(false);

    const wrapper = mount(ActivityDetailsPage);

    await flushPromises();

    await wrapper.vm.$nextTick();

    await wrapper.find(".project-status-card").trigger("click");

    expect(wrapper.text()).not.toContain("Activité soumise à validation.");
  });

  it("prévisualise l'attestation PDF", async () => {
    const wrapper = mount(ActivityDetailsPage, {
      global: {
        stubs: {
          Teleport: true,
        },
      },
    });

    await flushPromises();

    await wrapper.find(".outline-action").trigger("click");
    await flushPromises();

    expect(downloadStudentActivityCertificate).toHaveBeenCalledWith(1);
    expect(wrapper.text()).toContain("Attestation");
    expect(wrapper.find("iframe").exists()).toBe(true);
  });

  it("affiche l'historique généré si validationHistory est vide", async () => {
    const wrapper = mount(ActivityDetailsPage);

    await flushPromises();

    expect(wrapper.text()).toContain("Brouillon créé");
    expect(wrapper.text()).toContain(
      "L’activité a été ajoutée à votre espace étudiant."
    );
  });
});
