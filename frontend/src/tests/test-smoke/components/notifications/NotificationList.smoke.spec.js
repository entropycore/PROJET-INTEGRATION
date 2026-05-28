import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import NotificationList from "@/components/notifications/NotificationsList.vue";

<<<<<<< HEAD
describe("NotificationList - Test de fumee", () => {
  it("monte le composant avec succes sans planter", () => {
=======
describe('NotificationList - Test de fumee', () => {
  it('monte le composant avec succes sans planter', () => {
>>>>>>> f631fb1e6bf4e352d9d8ebef2ec35dbe0244a48b
    const wrapper = mount(NotificationList, {
      props: {
        notifications: [],
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});
