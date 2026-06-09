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
    getStudentActivityById.mockResolvedValueOnce({
      data: {
        data: {
          ...baseActivity,
          certificateName: "",
          certificateUrl: "",
          certificateType: "",
        },
      },
    });

    const wrapper = mount(ActivityDetailsPage);

    await flushPromises();

    expect(wrapper.find(".validation-submit-btn").exists()).toBe(false);
    expect(wrapper.text()).toContain(
      "Aucune attestation ajoutée pour cette activité."
    );
    expect(submitStudentActivityValidation).not.toHaveBeenCalled();
  });

  it("affiche une erreur si le chargement de l'activité échoue", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    getStudentActivityById.mockRejectedValueOnce(new Error("API down"));

    const wrapper = mount(ActivityDetailsPage);

    await flushPromises();

    expect(wrapper.text()).toContain("Impossible de charger cette activité.");
    expect(wrapper.find(".project-details-header").exists()).toBe(false);

    consoleErrorSpy.mockRestore();
  });

  it("masque les actions si les règles métier ne les autorisent pas", async () => {
    canEditActivity.mockReturnValue(false);
    canDeleteActivity.mockReturnValue(false);
    canSubmitActivity.mockReturnValue(false);

    const wrapper = mount(ActivityDetailsPage);

    await flushPromises();

    expect(wrapper.find(".secondary-action").exists()).toBe(false);
    expect(wrapper.find(".delete-project-button").exists()).toBe(false);
    expect(wrapper.find(".validation-submit-btn").exists()).toBe(false);
  });

  it("affiche une erreur si la suppression échoue", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    deleteStudentActivity.mockRejectedValueOnce(new Error("Delete failed"));

    const wrapper = mount(ActivityDetailsPage);

    await flushPromises();

    await wrapper.find(".delete-project-button").trigger("click");
    await flushPromises();

    expect(deleteStudentActivity).toHaveBeenCalledWith(1);
    expect(pushMock).not.toHaveBeenCalledWith("/student/activities");
    expect(wrapper.text()).toContain("Impossible de supprimer cette activité.");

    consoleErrorSpy.mockRestore();
  });

  it("affiche le message d'erreur de l'API si la soumission échoue", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    submitStudentActivityValidation.mockRejectedValueOnce({
      response: {
        data: {
          message: "Attestation obligatoire.",
        },
      },
    });

    const wrapper = mount(ActivityDetailsPage);

    await flushPromises();

    await wrapper.find(".validation-submit-btn").trigger("click");
    await flushPromises();

    expect(submitStudentActivityValidation).toHaveBeenCalledWith(1);
    expect(wrapper.text()).toContain("Attestation obligatoire.");

    consoleErrorSpy.mockRestore();
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

  it("affiche une erreur si la prévisualisation reçoit une réponse invalide", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    downloadStudentActivityCertificate.mockResolvedValueOnce({
      data: new Blob(["<html></html>"], { type: "text/html" }),
      headers: { "content-type": "text/html" },
    });

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
    expect(wrapper.text()).toContain("Impossible de charger");
    expect(wrapper.find("iframe").exists()).toBe(false);

    consoleErrorSpy.mockRestore();
  });

  it("affiche l'historique généré si validationHistory est vide", async () => {
    const wrapper = mount(ActivityDetailsPage);

    await flushPromises();

    expect(wrapper.text()).toContain("Brouillon créé");
    expect(wrapper.text()).toContain(
      "L’activité a été ajoutée à votre espace étudiant."
    );
  });

  it("trie l'historique de validation du plus récent au plus ancien", async () => {
    getStudentActivityById.mockResolvedValueOnce({
      data: {
        data: {
          ...baseActivity,
          validationHistory: [
            {
              id: 1,
              title: "Ancienne action",
              comment: "Ancien commentaire",
              createdAt: "2025-02-02",
              actorName: "Admin",
              tone: "draft",
            },
            {
              id: 2,
              title: "Action récente",
              comment: "Commentaire récent",
              createdAt: "2025-02-05",
              actorName: "Admin",
              tone: "approved",
            },
          ],
        },
      },
    });

    const wrapper = mount(ActivityDetailsPage);

    await flushPromises();

    const items = wrapper.findAll(".timeline-item");

    expect(items).toHaveLength(2);
    expect(items[0].text()).toContain("Action récente");
    expect(items[1].text()).toContain("Ancienne action");
  });

  it("vérifie les vraies règles métier des activités", async () => {
    const rules = await vi.importActual(
      "@/components/student/activities/activityRules"
    );

    expect(
      rules.canSubmitActivity({
        validationStatus: "DRAFT",
        certificateName: "certificat.pdf",
      })
    ).toBe(true);
    expect(
      rules.canSubmitActivity({
        validationStatus: "DRAFT",
        certificateName: "",
      })
    ).toBe(false);
    expect(
      rules.canDeleteActivity({
        validationStatus: "APPROVED",
      })
    ).toBe(false);
    expect(
      rules.canEditActivity({
        validationStatus: "CORRECTION_REQUIRED",
      })
    ).toBe(true);
  });
});
