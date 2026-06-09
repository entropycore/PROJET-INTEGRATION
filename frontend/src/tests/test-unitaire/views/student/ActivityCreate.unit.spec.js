import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import ActivityCreatePage from "@/views/student/ActivityCreate.vue";
import {
  createStudentActivity,
  uploadStudentActivityCertificate,
} from "@/services/studentActivitiesService";

const pushMock = vi.fn();

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/services/studentActivitiesService", () => ({
  createStudentActivity: vi.fn(),
  uploadStudentActivityCertificate: vi.fn(),
}));

vi.mock("@/components/student/activities/ActivityForm.vue", () => ({
  default: {
    props: ["submitLabel"],
    emits: ["save-activity", "cancel"],
    template: `
      <div class="activity-form">
        <span>{{ submitLabel }}</span>
        <button class="save" @click="$emit('save-activity', mockPayload)">save</button>
        <button class="cancel" @click="$emit('cancel')">cancel</button>
      </div>
    `,
    data() {
      return {
        mockPayload: {
          title: "Club Robotique",
          organization: "ENSA",
          description: "Participation au club",
          type: "CLUB",
          startDate: "2025-01-01",
          endDate: "2025-02-01",
          certificateName: "attestation.pdf",
          certificateUrl: "/old.pdf",
          certificate: new File(["test"], "attestation.pdf"),
        },
      };
    },
  },
}));

const flushPromises = () => new Promise((resolve) => setTimeout(resolve));

describe("ActivityCreatePage - Unit", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    createStudentActivity.mockResolvedValue({
      data: { data: { id: 7 } },
    });

    uploadStudentActivityCertificate.mockResolvedValue({});
  });

  it("crée une activité sans envoyer certificate dans le payload principal", async () => {
    const wrapper = mount(ActivityCreatePage);

    await wrapper.find(".save").trigger("click");
    await flushPromises();

    expect(createStudentActivity).toHaveBeenCalledWith(
      expect.not.objectContaining({
        certificate: expect.anything(),
        certificateName: expect.anything(),
        certificateUrl: expect.anything(),
      })
    );
  });

  it("upload l'attestation si certificate est un File", async () => {
    const wrapper = mount(ActivityCreatePage);

    await wrapper.find(".save").trigger("click");
    await flushPromises();

    expect(uploadStudentActivityCertificate).toHaveBeenCalledWith(
      7,
      expect.any(File)
    );
  });

  it("redirige vers la page détail après création", async () => {
    const wrapper = mount(ActivityCreatePage);

    await wrapper.find(".save").trigger("click");
    await flushPromises();

    expect(pushMock).toHaveBeenCalledWith("/student/activities/7");
  });

  it("affiche un message d'erreur si la création échoue", async () => {
    createStudentActivity.mockRejectedValueOnce({
      response: {
        data: {
          message: "Titre obligatoire",
        },
      },
    });

    const wrapper = mount(ActivityCreatePage);

    await wrapper.find(".save").trigger("click");
    await flushPromises();

    expect(wrapper.text()).toContain("Titre obligatoire");
  });

  it("retourne vers la liste si le formulaire annule", async () => {
    const wrapper = mount(ActivityCreatePage);

    await wrapper.find(".cancel").trigger("click");

    expect(pushMock).toHaveBeenCalledWith("/student/activities");
  });
});
