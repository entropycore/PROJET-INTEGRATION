import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import NotificationItem from "@/components/notifications/NotificationItem.vue";

describe("NotificationItem - Tests UI et Interactions", () => {
  const mockNotification = (overrides = {}) => ({
    id: 1,
    title: "Alerte Sécurité",
    message: "Connexion suspecte détectée",
    type: "ALERT",
    read: false,
    createdAt: "2026-05-21T18:00:00.000Z",
    ...overrides,
  });

  it("affiche les textes de la notification correctement", () => {
    const wrapper = mount(NotificationItem, {
      props: { notification: mockNotification() },
    });

    expect(wrapper.find("h3").text()).toBe("Alerte Sécurité");
    expect(wrapper.find("p").text()).toBe("Connexion suspecte détectée");
  });

  it("ajoute la classe 'unread' et montre le bouton de lecture quand la notification n'est pas lue", () => {
    const wrapper = mount(NotificationItem, {
      props: { notification: mockNotification({ read: false }) },
    });

    expect(wrapper.find(".item").classes()).toContain("unread");
    expect(wrapper.find(".icon-btn.read").exists()).toBe(true);
  });

  it("retire la classe 'unread' et cache le bouton de lecture quand la notification est lue", () => {
    const wrapper = mount(NotificationItem, {
      props: { notification: mockNotification({ read: true }) },
    });

    expect(wrapper.find(".item").classes()).not.toContain("unread");
    expect(wrapper.find(".icon-btn.read").exists()).toBe(false);
  });

  it("émet l'événement 'read' lors du clic sur le bouton Lu", async () => {
    const wrapper = mount(NotificationItem, {
      props: { notification: mockNotification({ read: false }) },
    });

    await wrapper.find(".icon-btn.read").trigger("click");

    // Vérifie que l'émit a bien été déclenché
    expect(wrapper.emitted()).toHaveProperty("read");
    expect(wrapper.emitted("read")[0]).toEqual([]);
  });

  it("émet l'événement 'delete' lors du clic sur le bouton Supprimer", async () => {
    const wrapper = mount(NotificationItem, {
      props: { notification: mockNotification() },
    });

    await wrapper.find(".icon-btn.delete").trigger("click");

    expect(wrapper.emitted()).toHaveProperty("delete");
    expect(wrapper.emitted("delete")[0]).toEqual([]);
  });
});
