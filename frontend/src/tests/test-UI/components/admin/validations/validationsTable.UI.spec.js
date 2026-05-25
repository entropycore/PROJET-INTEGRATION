import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import ValidationsTable from "@/components/admin/validations/ValidationsTable.vue";

const validation = {
  id: 1,
  title: "Projet ValiDia",
  description: "Application de validation",
  targetType: "PROJECT",
  status: "PENDING",
  submittedAt: "2026-05-21T14:30:00.000Z",
  student: {
    fullName: "Yassine K.",
    email: "yassine@example.com",
  },
};

describe("ValidationsTable - Tests UI", () => {
  it("affiche un etat vide", () => {
    const wrapper = mount(ValidationsTable, { props: { validations: [] } });

    expect(wrapper.find(".empty").exists()).toBe(true);
    expect(wrapper.text()).toContain("Aucune validation");
  });

  it("affiche les donnees et emet les actions", async () => {
    const wrapper = mount(ValidationsTable, {
      props: { validations: [validation] },
    });

    expect(wrapper.findAll(".table-row")).toHaveLength(1);
    expect(wrapper.text()).toContain("Projet ValiDia");
    expect(wrapper.text()).toContain("Yassine K.");

    await wrapper.find(".approve").trigger("click");
    await wrapper.find(".reject").trigger("click");

    expect(wrapper.emitted("approve")[0][0]).toEqual(validation);
    expect(wrapper.emitted("reject")[0][0]).toEqual(validation);
  });
});
