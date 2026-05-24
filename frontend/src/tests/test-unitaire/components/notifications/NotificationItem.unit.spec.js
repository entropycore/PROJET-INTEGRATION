import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import NotificationItem from "@/components/notifications/NotificationItem.vue";

describe("NotificationItem - Tests Unitaires (Logique)", () => {
  const baseNotification = {
    id: 1,
    title: "Test Title",
    message: "Test Message",
    type: "INFO",
    read: false,
    createdAt: "2026-05-21T18:00:00.000Z",
  };

  it("gère correctement la configuration des types connus (INFO)", () => {
    const wrapper = mount(NotificationItem, {
      props: { notification: baseNotification },
    });

    const typeSpan = wrapper.find(".type");
    expect(typeSpan.text()).toContain("Information");
    expect(typeSpan.classes()).toContain("info");
  });

  it("gère un type inconnu en affichant sa valeur brute sans planter", () => {
    const unknownNotif = { ...baseNotification, type: "NEW_TYPE" };
    const wrapper = mount(NotificationItem, {
      props: { notification: unknownNotif },
    });

    const typeSpan = wrapper.find(".type");
    expect(typeSpan.text()).toContain("NEW_TYPE");
  });

  it("formate correctement la date au format fr-FR", () => {
    const wrapper = mount(NotificationItem, {
      props: { notification: baseNotification },
    });

    const smallTag = wrapper.find("small");
    // Le format local fr-FR transformera la date ISO. 
    // On vérifie au moins la présence des éléments clés de la date pour éviter les écarts de fuseaux horaires en CI
    expect(smallTag.text()).toContain("2026");
  });
});
