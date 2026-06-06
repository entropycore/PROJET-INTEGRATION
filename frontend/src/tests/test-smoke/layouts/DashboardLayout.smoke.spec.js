import { mount } from "@vue/test-utils";
import DashboardLayout from "@/layouts/DashboardLayout.vue";

describe("DashboardLayout - Test de fumee", () => {
  it("monte le composant sans planter", () => {
    const wrapper = mount(DashboardLayout, {
      global: {
        stubs: {
          Sidebar: true,
          Topbar: true,
          RouterView: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});
