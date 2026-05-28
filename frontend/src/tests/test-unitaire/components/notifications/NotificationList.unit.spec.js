import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";
import NotificationList from "@/components/notifications/NotificationsList.vue";
import NotificationItem from "@/components/notifications/NotificationItem.vue";

<<<<<<< HEAD
describe('NotificationList - Test unitaire', () => {
  it('affiche un NotificationItem pour chaque notification', () => {
=======
describe("NotificationList - Unit Test", () => {
  it("renders NotificationItem for each notification", () => {
>>>>>>> 3dce0a3e27749bbf804690e5e1c08da883d1e98c
    const notifications = [
      { id: 1, title: "Notif 1" },
      { id: 2, title: "Notif 2" },
    ];

    const wrapper = shallowMount(NotificationList, {
      props: { notifications },
    });

    const items = wrapper.findAllComponents(NotificationItem);

    expect(items.length).toBe(2);
  });

<<<<<<< HEAD
  it('affiche le message vide quand la liste des notifications est vide', () => {
=======
  it("shows empty message when notifications array is empty", () => {
>>>>>>> 3dce0a3e27749bbf804690e5e1c08da883d1e98c
    const wrapper = shallowMount(NotificationList, {
      props: {
        notifications: [],
      },
    });

    expect(wrapper.text()).toContain("Aucune notification trouvée.");
  });
});
