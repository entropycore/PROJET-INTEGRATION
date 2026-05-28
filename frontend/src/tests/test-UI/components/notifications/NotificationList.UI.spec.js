import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import NotificationList from "@/components/notifications/NotificationsList.vue";

<<<<<<< HEAD
describe("NotificationList - Test UI", () => {
  it("emet l'evenement read quand NotificationItem emet read", async () => {
    const notifications = [{ id: 1, title: "Notification de test" }];
=======
describe('NotificationList - Test UI', () => {
  it("emet l'evenement read quand NotificationItem emet read", async () => {
    const notifications = [
      { id: 1, title: 'Notification de test' },
    ];
>>>>>>> f631fb1e6bf4e352d9d8ebef2ec35dbe0244a48b

    const wrapper = mount(NotificationList, {
      props: { notifications },
      global: {
        stubs: {
          NotificationItem: {
<<<<<<< HEAD
            template: "<button @click=\"$emit('read')\">Lire</button>",
=======
            template: '<button @click="$emit(\'read\')">Lire</button>',
>>>>>>> f631fb1e6bf4e352d9d8ebef2ec35dbe0244a48b
          },
        },
      },
    });

    await wrapper.find("button").trigger("click");

    expect(wrapper.emitted("read")).toBeTruthy();
    expect(wrapper.emitted("read")?.length).toBe(1);
  });

  it("emet l'evenement delete avec l'identifiant de notification", async () => {
<<<<<<< HEAD
    const notifications = [{ id: 7, title: "A supprimer" }];
=======
    const notifications = [
      { id: 7, title: 'A supprimer' },
    ];
>>>>>>> f631fb1e6bf4e352d9d8ebef2ec35dbe0244a48b

    const wrapper = mount(NotificationList, {
      props: { notifications },
      global: {
        stubs: {
          NotificationItem: {
<<<<<<< HEAD
            template: "<button @click=\"$emit('delete')\">Supprimer</button>",
=======
            template: '<button @click="$emit(\'delete\')">Supprimer</button>',
>>>>>>> f631fb1e6bf4e352d9d8ebef2ec35dbe0244a48b
          },
        },
      },
    });

    await wrapper.find("button").trigger("click");

    expect(wrapper.emitted("delete")).toBeTruthy();
    expect(wrapper.emitted("delete")?.[0]).toEqual([7]);
  });
});
