import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import NotificationList from "@/components/notifications/NotificationsList.vue";

<<<<<<< HEAD
describe('NotificationList - Test UI', () => {
  it("emet l'evenement read quand NotificationItem emet read", async () => {
    const notifications = [
      { id: 1, title: 'Notification de test' },
    ];
=======
describe("NotificationList - UI Test", () => {
  it("emits read event when NotificationItem emits read", async () => {
    const notifications = [{ id: 1, title: "Test notification" }];
>>>>>>> 3dce0a3e27749bbf804690e5e1c08da883d1e98c

    const wrapper = mount(NotificationList, {
      props: { notifications },
      global: {
        stubs: {
          NotificationItem: {
<<<<<<< HEAD
            template: '<button @click="$emit(\'read\')">Lire</button>',
=======
            template: "<button @click=\"$emit('read')\">Read</button>",
>>>>>>> 3dce0a3e27749bbf804690e5e1c08da883d1e98c
          },
        },
      },
    });

    await wrapper.find("button").trigger("click");

    expect(wrapper.emitted("read")).toBeTruthy();
    expect(wrapper.emitted("read")?.length).toBe(1);
  });

<<<<<<< HEAD
  it("emet l'evenement delete avec l'identifiant de notification", async () => {
    const notifications = [
      { id: 7, title: 'A supprimer' },
    ];
=======
  it("emits delete event with notification id", async () => {
    const notifications = [{ id: 7, title: "Delete me" }];
>>>>>>> 3dce0a3e27749bbf804690e5e1c08da883d1e98c

    const wrapper = mount(NotificationList, {
      props: { notifications },
      global: {
        stubs: {
          NotificationItem: {
<<<<<<< HEAD
            template: '<button @click="$emit(\'delete\')">Supprimer</button>',
=======
            template: "<button @click=\"$emit('delete')\">Delete</button>",
>>>>>>> 3dce0a3e27749bbf804690e5e1c08da883d1e98c
          },
        },
      },
    });

    await wrapper.find("button").trigger("click");

    expect(wrapper.emitted("delete")).toBeTruthy();
    expect(wrapper.emitted("delete")?.[0]).toEqual([7]);
  });
});
