import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import Badges from "@/views/admin/Badges.vue";

describe("Badges - Tests unitaires", () => {
  it("ouvre le modal quand on clique sur Nouveau badge", async () => {
    const wrapper = mount(Badges);

    const button = wrapper.find(".primary-btn");

    await button.trigger("click");

    expect(wrapper.text()).toContain("Nouveau badge");
  });

it("ferme le modal quand on clique sur Annuler", async () => {
  const wrapper = mount(Badges);

  await wrapper.find(".primary-btn").trigger("click");

  expect(wrapper.find(".modal").exists()).toBe(true);

  const cancelBtn = wrapper.find(".cancel-btn");

  await cancelBtn.trigger("click");

  expect(wrapper.find(".modal").exists()).toBe(false);
});

  it("affiche une alerte si les champs sont vides", async () => {
    window.alert = vi.fn();

    const wrapper = mount(Badges);

    await wrapper.find(".primary-btn").trigger("click");

    await wrapper.find(".create-btn").trigger("click");

    expect(window.alert).toHaveBeenCalled();
  });
});
