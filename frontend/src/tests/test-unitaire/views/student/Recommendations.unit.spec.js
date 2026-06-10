import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import StudentRecommendations from "@/views/student/Recommendations.vue";

vi.mock("@/services/studentRecommendationsService", () => ({
  getStudentRecommendationsData: vi.fn().mockResolvedValue({
    stats: {
      received: 1,
      pending: 1,
      rejected: 1,
    },
    recommendations: [
      {
        id: 1,
        status: "PENDING",
        content: "Rec 1",
        createdAt: "2025-01-01",
        author: {
          id: 1,
          name: "Ahmed",
          initials: "A",
          role: "Prof",
          organization: "ENSA",
        },
      },
      {
        id: 2,
        status: "REJECTED",
        content: "Rec 2",
        createdAt: "2025-01-01",
        author: {
          id: 2,
          name: "Sara",
          initials: "S",
          role: "Mentor",
          organization: "EMI",
        },
      },
    ],
  }),
  updateRecommendationStatus: vi.fn(),
}));

describe("StudentRecommendations Unit Test", () => {
  it("filters recommendations correctly", async () => {
    const wrapper = mount(StudentRecommendations);

    await new Promise((r) => setTimeout(r, 0));

    wrapper.vm.selectedFilter = "REJECTED";

    await wrapper.vm.$nextTick();

    expect(
      wrapper.vm.filteredRecommendations.every(
        (r) => r.status === "REJECTED",
      ),
    ).toBe(true);
  });
});
