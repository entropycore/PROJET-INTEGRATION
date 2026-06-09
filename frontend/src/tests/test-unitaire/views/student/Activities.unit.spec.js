import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import StudentActivities from "@/views/student/Activities.vue";
import {
  getStudentActivities,
  deleteStudentActivity,
  submitStudentActivityValidation,
} from "@/services/studentActivitiesService";
import {
  canSubmitActivity,
  hasActivityCertificate,
} from "@/components/student/activities/activityRules";

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
  canSubmitActivity: vi.fn(),
  hasActivityCertificate: vi.fn(),
}));

vi.mock("@/components/student/activities/ActivityFilters.vue", () => ({
  default: {
    props: ["search", "status", "type"],
    emits: ["update:search", "update:status", "update:type"],
    template: `
      <div class="activity-filters">
        <button class="search-club" @click="$emit('update:search', 'club')">search</button>
        <button class="filter-approved" @click="$emit('update:status', 'APPROVED')">status</button>
        <button class="filter-type" @click="$emit('update:type', 'COMPETITION')">type</button>
      </div>
    `,
  },
}));

vi.mock("@/components/student/activities/ActivityCard.vue", () => ({
  default: {
    props: ["activity"],
    emits: ["delete-activity", "submit-validation"],
    template: `
      <div class="activity-card">
        <span>{{ activity.title }}</span>
        <button class="delete" @click="$emit('delete-activity', activity.id)">delete</button>
        <button class="submit" @click="$emit('submit-validation', activity.id)">submit</button>
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
    description: "Participation au club robotique",
    type: "CLUB",
    validationStatus: "DRAFT",
    certificateUrl: "/certificat.pdf",
  },
  {
    id: 2,
    title: "Hackathon Orange",
    organization: "Orange",
    description: "Compétition tech",
    type: "COMPETITION",
    validationStatus: "APPROVED",
    certificateUrl: "/attestation.pdf",
  },
];

describe("StudentActivities - Unit", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    window.confirm = vi.fn(() => true);

    getStudentActivities.mockResolvedValue({
      data: { data: activitiesMock },
    });

    deleteStudentActivity.mockResolvedValue({});
    submitStudentActivityValidation.mockResolvedValue({});
    canSubmitActivity.mockReturnValue(true);
    hasActivityCertificate.mockReturnValue(true);
  });

  it("filtre les activités par recherche", async () => {
    const wrapper = mount(StudentActivities);

    await flushPromises();

    await wrapper.find(".search-club").trigger("click");

    expect(wrapper.text()).toContain("Club Robotique");
    expect(wrapper.text()).not.toContain("Hackathon Orange");
  });

  it("filtre les activités par statut", async () => {
    const wrapper = mount(StudentActivities);

    await flushPromises();

    await wrapper.find(".filter-approved").trigger("click");

    expect(wrapper.text()).toContain("Hackathon Orange");
    expect(wrapper.text()).not.toContain("Club Robotique");
  });

  it("filtre les activités par type", async () => {
    const wrapper = mount(StudentActivities);

    await flushPromises();

    await wrapper.find(".filter-type").trigger("click");

    expect(wrapper.text()).toContain("Hackathon Orange");
    expect(wrapper.text()).not.toContain("Club Robotique");
  });

  it("supprime une activité après confirmation", async () => {
    const wrapper = mount(StudentActivities);

    await flushPromises();

    await wrapper.find(".delete").trigger("click");
    await flushPromises();

    expect(window.confirm).toHaveBeenCalled();
    expect(deleteStudentActivity).toHaveBeenCalledWith(1);
    expect(getStudentActivities).toHaveBeenCalledTimes(2);
  });

  it("ne supprime pas si l'utilisateur annule", async () => {
    window.confirm = vi.fn(() => false);

    const wrapper = mount(StudentActivities);

    await flushPromises();

    await wrapper.find(".delete").trigger("click");

    expect(deleteStudentActivity).not.toHaveBeenCalled();
  });

  it("soumet une activité valide à la validation", async () => {
    const wrapper = mount(StudentActivities);

    await flushPromises();

    await wrapper.find(".submit").trigger("click");
    await flushPromises();

    expect(canSubmitActivity).toHaveBeenCalledWith(activitiesMock[0]);
    expect(submitStudentActivityValidation).toHaveBeenCalledWith(1);
    expect(wrapper.text()).toContain("Activité soumise à validation.");
  });

  it("affiche message si activité sans attestation", async () => {
    canSubmitActivity.mockReturnValue(false);
    hasActivityCertificate.mockReturnValue(false);

    const wrapper = mount(StudentActivities);

    await flushPromises();

    await wrapper.find(".submit").trigger("click");

    expect(submitStudentActivityValidation).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain(
      "Veuillez ajouter une attestation avant de soumettre cette activité."
    );
  });

  it("affiche message si activité pas en brouillon", async () => {
    canSubmitActivity.mockReturnValue(false);
    hasActivityCertificate.mockReturnValue(true);

    const wrapper = mount(StudentActivities);

    await flushPromises();

    await wrapper.find(".submit").trigger("click");

    expect(submitStudentActivityValidation).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain(
      "Seules les activités en brouillon peuvent être soumises."
    );
  });
});
