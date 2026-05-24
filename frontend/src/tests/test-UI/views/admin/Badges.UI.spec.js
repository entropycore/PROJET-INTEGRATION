import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import Badges from "@/views/admin/Badges.vue";

describe("Badges - Tests UI", () => {
  it("affiche les badges", () => {
    const wrapper = mount(Badges);

    expect(wrapper.text()).toContain("Web Developer");
    expect(wrapper.text()).toContain("DevOps Explorer");
    expect(wrapper.text()).toContain("Hackathon Participant");
  });

  it("ajoute un nouveau badge", async () => {
    const wrapper = mount(Badges);

    await wrapper.find(".primary-btn").trigger("click");

    const inputs = wrapper.findAll("input");

    await inputs[1].setValue("Backend Expert");

    const textarea = wrapper.find("textarea");

    await textarea.setValue("Créer une API sécurisée");

    await wrapper.find(".create-btn").trigger("click");

    expect(wrapper.text()).toContain("Backend Expert");
  });

  it("modifie un badge", async () => {
    const wrapper = mount(Badges);

    const editButtons = wrapper.findAll(".edit-btn");

    await editButtons[0].trigger("click");

    const nameInput = wrapper.findAll("input")[1];

    await nameInput.setValue("Senior Web Developer");

    await wrapper.find(".create-btn").trigger("click");

    expect(wrapper.text()).toContain("Senior Web Developer");
  });
});
