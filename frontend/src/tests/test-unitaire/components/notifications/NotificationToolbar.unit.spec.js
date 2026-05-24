import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import NotificationToolbar from "@/components/notifications/NotificationToolbar.vue";

describe("NotificationToolbar.vue", () => {
  it("affiche correctement les proprietes", () => {
    const wrapper = mount(NotificationToolbar, {
      props: {
        unreadCount: 5,
        selectedType: "INFO",
      },
    });

    const select = wrapper.find("select");

    expect(select.element.value).toBe("INFO");
  });

  it("emet update:selectedType quand le champ de selection change", async () => {
    const wrapper = mount(NotificationToolbar, {
      props: {
        unreadCount: 0,
        selectedType: "ALL",
      },
    });

    const select = wrapper.find("select");

    await select.setValue("ALERT");

    expect(wrapper.emitted("update:selectedType")).toBeTruthy();
    expect(wrapper.emitted("update:selectedType")[0]).toEqual(["ALERT"]);
  });

  it("emet read-all quand on clique sur le bouton", async () => {
    const wrapper = mount(NotificationToolbar, {
      props: {
        unreadCount: 3,
        selectedType: "ALL",
      },
    });

    const button = wrapper.find("button");

    await button.trigger("click");

    expect(wrapper.emitted("read-all")).toBeTruthy();
    expect(wrapper.emitted("read-all")).toHaveLength(1);
  });

  it("affiche toutes les options du champ de selection", () => {
    const wrapper = mount(NotificationToolbar, {
      props: {
        unreadCount: 0,
        selectedType: "ALL",
      },
    });

    const options = wrapper.findAll("option");

    expect(options).toHaveLength(4);

    expect(options[0].text()).toBe("Tous les types");
    expect(options[1].text()).toBe("Inscription");
    expect(options[2].text()).toBe("Validation");
    expect(options[3].text()).toBe("Alerte");
  });
});
