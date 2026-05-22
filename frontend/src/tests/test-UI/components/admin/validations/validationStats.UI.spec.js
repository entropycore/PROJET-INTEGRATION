import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import ValidationStats from "@/components/admin/validations/ValidationStats.vue";

const stats = {
  count: 9,
  projects: 3,
  internships: 2,
  certificates: 3,
  activities: 1,
};

describe("ValidationStats - Tests UI", () => {
  it("affiche les cinq cartes de statistiques", () => {
    const wrapper = mount(ValidationStats, { props: { stats } });

    expect(wrapper.findAll(".stat-card")).toHaveLength(5);
    expect(wrapper.find(".stat-card.total strong").text()).toBe("9");
    expect(wrapper.find(".stat-card.project strong").text()).toBe("3");
    expect(wrapper.find(".stat-card.activity strong").text()).toBe("1");
  });
});
