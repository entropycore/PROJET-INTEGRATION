import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Toolbar from "@/components/notifications/NotificationToolbar.vue";

describe("Toolbar UI", () => {
  it("l'utilisateur peut changer le filtre", async () => {
    const wrapper = mount(Toolbar, {
      props: {
        unreadCount: 2,
        selectedType: "ALL",
      },
    });

    const select = wrapper.find("select");

    await select.setValue("VALIDATION");

    expect(select.element.value).toBe("VALIDATION");
  });

  it("le bouton est visible avec le bon texte", () => {
    const wrapper = mount(Toolbar, {
      props: {
        unreadCount: 1,
        selectedType: "ALL",
      },
    });

    const button = wrapper.find("button");

    expect(button.exists()).toBe(true);
    expect(button.text()).toContain("Tout marquer comme lu");
  });

  it("les éléments principaux existent dans l'UI", () => {
    const wrapper = mount(Toolbar, {
      props: {
        unreadCount: 0,
        selectedType: "ALL",
      },
    });

    expect(wrapper.find(".toolbar").exists()).toBe(true);
    expect(wrapper.find(".toolbar-actions").exists()).toBe(true);
    expect(wrapper.find(".filter-group").exists()).toBe(true);
    expect(wrapper.find("select").exists()).toBe(true);
    expect(wrapper.find("button").exists()).toBe(true);
  });
});
