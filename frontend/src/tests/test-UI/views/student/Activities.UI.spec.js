import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import StudentActivities from "@/views/student/Activities.vue";
import { getStudentActivities } from "@/services/studentActivitiesService";

const pushMock = vi.fn();

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/services/studentActivitiesService", () => ({
  getStudentActivities: vi.fn(),
  deleteStudentActivity: vi.fn(),
  submitStudentActivityValidation: vi.fn(),
}));

vi.mock("@/components/student/activities/activityRules", () => ({
  canSubmitActivity: vi.fn(() => true),
  hasActivityCertificate: vi.fn(() => true),
}));

vi.mock("@/components/student/activities/ActivityFilters.vue", () => ({
  default: {
    props: ["search", "status", "type"],
    emits: ["update:search", "update:status", "update:type"],
    template: "<div class='activity-filters'>Filters</div>",
  },
}));

vi.mock("@/components/student/activities/ActivityCard.vue", () => ({
  default: {
    props: ["activity"],
    template: `
      <div class="activity-card">
        {{ activity.title }} - {{ activity.organization }}
      </div>
    `,
  },
}));

const flushPromises = () => new Promise((resolve) => setTimeout(resolve));

const activitiesMock = [
  {
    id: 1,
    title: "Club Robotique",
    organization: "ENSA",
    description: "Participation au club",
    type: "CLUB",
    validationStatus: "DRAFT",
    certificateUrl: "/certificat.pdf",
  },
  {
    id: 2,
    title: "Hackathon",
    organization: "Orange",
    description: "Compétition tech",
    type: "COMPETITION",
    validationStatus: "APPROVED",
    certificateUrl: "/attestation.pdf",
  },
];

describe("StudentActivities - UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getStudentActivities.mockResolvedValue({
      data: { data: activitiesMock },
    });
  });

  it("affiche le titre et le bouton ajouter", async () => {
    const wrapper = mount(StudentActivities);

    await flushPromises();

    expect(wrapper.text()).toContain("Mes activités parascolaires");
    expect(wrapper.text()).toContain("Ajouter une activité");
  });

  it("affiche les filtres", async () => {
    const wrapper = mount(StudentActivities);

    await flushPromises();

    expect(wrapper.find(".activity-filters").exists()).toBe(true);
  });

  it("affiche les activités récupérées", async () => {
    const wrapper = mount(StudentActivities);

    await flushPromises();

    expect(wrapper.text()).toContain("Club Robotique");
    expect(wrapper.text()).toContain("Hackathon");
    expect(wrapper.text()).toContain("ENSA");
    expect(wrapper.text()).toContain("Orange");
  });

  it("affiche le message vide si aucune activité", async () => {
    getStudentActivities.mockResolvedValueOnce({
      data: { data: [] },
    });

    const wrapper = mount(StudentActivities);

    await flushPromises();

    expect(wrapper.text()).toContain("Aucune activité trouvée");
  });

  it("navigue vers la création d'une activité", async () => {
    const wrapper = mount(StudentActivities);

    await flushPromises();

    await wrapper.find(".add-btn").trigger("click");

    expect(pushMock).toHaveBeenCalledWith("/student/activities/create");
  });
});
