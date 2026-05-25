import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import NotificationList from "@/components/notifications/NotificationsList.vue";

describe('NotificationList - Test UI', () => {
  it("emet l'evenement read quand NotificationItem emet read", async () => {
    const notifications = [
      { id: 1, title: 'Notification de test' },
    ];

    const wrapper = mount(NotificationList, {
      props: { notifications },
      global: {
        stubs: {
          NotificationItem: {
            template: '<button @click="$emit(\'read\')">Lire</button>',
          },
        },
      },
    });

    await wrapper.find("button").trigger("click");

    expect(wrapper.emitted("read")).toBeTruthy();
    expect(wrapper.emitted("read")?.length).toBe(1);
  });

  it("emet l'evenement delete avec l'identifiant de notification", async () => {
    const notifications = [
      { id: 7, title: 'A supprimer' },
    ];

    const wrapper = mount(NotificationList, {
      props: { notifications },
      global: {
        stubs: {
          NotificationItem: {
            template: '<button @click="$emit(\'delete\')">Supprimer</button>',
          },
        },
      },
    });

    await wrapper.find("button").trigger("click");

    expect(wrapper.emitted("delete")).toBeTruthy();
    expect(wrapper.emitted("delete")?.[0]).toEqual([7]);
  });
});
