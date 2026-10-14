import { mount } from "@vue/test-utils";
import DashboardLayout from "@/layouts/DashboardLayout.vue";

// Composants simules
const SidebarStub = {
  template: `
    <div class="sidebar-stub">
      <button @click="$emit('toggle-sidebar')">Basculer</button>
      <span>{{ collapsed }}</span>
    </div>
  `,
  props: ["collapsed"],
};

const TopbarStub = {
  template: `<div class="topbar-stub">Topbar</div>`,
};

describe("DashboardLayout - Test UI", () => {
  it("affiche correctement Topbar et Sidebar", () => {
    const wrapper = mount(DashboardLayout, {
      global: {
        stubs: {
          Sidebar: SidebarStub,
          Topbar: TopbarStub,
          RouterView: true,
        },
      },
    });

    expect(wrapper.find(".topbar-stub").exists()).toBe(true);
    expect(wrapper.find(".sidebar-stub").exists()).toBe(true);
  });

  it("bascule l'etat reduit de la Sidebar quand l'evenement est emis", async () => {
    const wrapper = mount(DashboardLayout, {
      global: {
        stubs: {
          Sidebar: SidebarStub,
          Topbar: TopbarStub,
          RouterView: true,
        },
      },
    });

    // Etat initial
    expect(wrapper.text()).toContain("false");

    // Declenche l'evenement de bascule
    await wrapper.find("button").trigger("click");

    // Etat mis a jour
    expect(wrapper.text()).toContain("true");
  });
});
