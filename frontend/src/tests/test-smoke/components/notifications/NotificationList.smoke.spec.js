import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import NotificationList from "@/components/notifications/NotificationsList.vue";

<<<<<<< HEAD
describe('NotificationList - Test de fumee', () => {
  it('monte le composant avec succes sans planter', () => {
=======
describe("NotificationList - Smoke Test", () => {
  it("mounts successfully without crashing", () => {
>>>>>>> 3dce0a3e27749bbf804690e5e1c08da883d1e98c
    const wrapper = mount(NotificationList, {
      props: {
        notifications: [],
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});
