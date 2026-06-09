import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import StudentRecommendations from "@/views/StudentRecommendations.vue";

vi.mock("@/services/studentRecommendationsService", () => ({
  getStudentRecommendationsData: vi.fn().mockResolvedValue({
    stats: {
      received: 1,
      pending: 1,
      rejected: 0,
    },
    recommendations: [
      {
        id: 1,
        status: "PENDING",
        content: "Excellent étudiant",
        createdAt: "2025-01-01",
        author: {
          id: 1,
          name: "Ahmed",
          initials: "A",
          role: "Professeur",
          organization: "ENSA",
        },
      },
    ],
  }),
  updateRecommendationStatus: vi.fn(),
}));

describe("StudentRecommendations UI Test", () => {
  it("displays page title and recommendation content", async () => {
    const wrapper = mount(StudentRecommendations);

    await new Promise((r) => setTimeout(r, 0));

    expect(wrapper.text()).toContain("Mes recommandations");
    expect(wrapper.text()).toContain("Excellent étudiant");
    expect(wrapper.text()).toContain("Ahmed");
  });
});