import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import ActivityCreatePage from "@/views/student/ActivityCreate.vue";

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
    template: "<div class='activity-form'>{{ submitLabel }}</div>",
  },
}));

describe("ActivityCreatePage - UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("affiche le titre et la description", () => {
    const wrapper = mount(ActivityCreatePage);

    expect(wrapper.text()).toContain("Nouvelle activité");
    expect(wrapper.text()).toContain(
      "Renseignez les informations et ajoutez une attestation"
    );
  });

  it("affiche le formulaire avec le bon label", () => {
    const wrapper = mount(ActivityCreatePage);

    expect(wrapper.find(".activity-form").exists()).toBe(true);
    expect(wrapper.text()).toContain("Créer l’activité");
  });

  it("retourne vers la liste des activités", async () => {
    const wrapper = mount(ActivityCreatePage);

    await wrapper.find(".back-btn").trigger("click");

    expect(pushMock).toHaveBeenCalledWith("/student/activities");
  });
});
