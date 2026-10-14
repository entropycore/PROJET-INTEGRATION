import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import ValidationDetailsModal from "@/components/admin/validations/ValidationDetailsModal.vue";

const validation = {
  id: 1,
  targetType: "PROJECT",
  title: "Plateforme projets",
  description: "Gestion des projets et validations",
  student: {
    fullName: "Sara Bensaid",
    email: "sara@example.com",
    field: "Genie informatique",
    level: "2eme annee",
    city: "Tanger",
  },
  content: {
    title: "Plateforme projets",
    description: "Gestion des projets et validations",
    files: [{ id: 1, name: "rapport.pdf", size: "1 Mo", url: "#" }],
  },
  targetDetails: {
    technologies: ["Vue.js", "Node.js"],
    visibility: "PUBLIC",
    createdAt: "2026-05-21T14:30:00.000Z",
  },
};

describe("ValidationDetailsModal - Tests UI", () => {
  it("affiche les informations principales", () => {
    const wrapper = mount(ValidationDetailsModal, { props: { validation } });

    expect(wrapper.text()).toContain("Plateforme projets");
    expect(wrapper.text()).toContain("Sara Bensaid");
    expect(wrapper.text()).toContain("rapport.pdf");
  });

  it("emet les actions utilisateur", async () => {
    const wrapper = mount(ValidationDetailsModal, { props: { validation } });

    await wrapper.find(".approve-btn").trigger("click");
    await wrapper.find(".reject-btn").trigger("click");
    await wrapper.find(".changes-btn").trigger("click");
    await wrapper.find(".close-btn").trigger("click");

    expect(wrapper.emitted("approve")[0][0]).toEqual(validation);
    expect(wrapper.emitted("reject")[0][0]).toEqual(validation);
    expect(wrapper.emitted("request-changes")[0][0]).toEqual(validation);
    expect(wrapper.emitted("close")).toHaveLength(1);
  });
});
