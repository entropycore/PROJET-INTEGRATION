<<<<<<< HEAD
import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import { createRouter, createWebHistory } from "vue-router";
import Sidebar from "../../../../components/dashboard/Sidebar.vue";

vi.mock("../../../../services/authService", () => ({
  logout: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../../config/sidebarConfig", () => ({
=======
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createWebHistory } from 'vue-router'
import Sidebar from '../../../../components/dashboard/Sidebar.vue'

// Mocks
vi.mock('../../../../services/authService', () => ({
  logout: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../../../config/sidebarConfig', () => ({
>>>>>>> f631fb1e6bf4e352d9d8ebef2ec35dbe0244a48b
  sidebarConfig: {
    admin: [
      {
        section: "Principal",
        items: [
          {
            label: "Tableau de bord",
            path: "/dashboard",
            icon: "dashboard.svg",
          },
        ],
      },
    ],
  },
}));

<<<<<<< HEAD
vi.stubGlobal(
  "URL",
  class {
    constructor(path) {
      this.href = `/mocked-icon/${path}`;
    }
  },
);
=======
// Stub des imports d'icones, car new URL(...).href n'existe pas dans jsdom.
vi.stubGlobal('URL', class {
  constructor(path) { this.href = `/mocked-icon/${path}` }
})
>>>>>>> f631fb1e6bf4e352d9d8ebef2ec35dbe0244a48b

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: { template: "<div />" } },
    { path: "/dashboard", component: { template: "<div />" } },
    { path: "/login", component: { template: "<div />" } },
  ],
});

const mountSidebar = (props = {}) =>
  mount(Sidebar, {
    props,
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            auth: {
              user: { firstName: "Alice", lastName: "Dupont", role: "admin" },
            },
          },
        }),
        router,
      ],
      stubs: { RouterLink: true },
    },
  });

<<<<<<< HEAD
describe("Sidebar - Tests de fumee", () => {
  it("se monte sans erreur", () => {
    expect(() => mountSidebar()).not.toThrow();
  });

  it("rend un element <aside>", () => {
    const wrapper = mountSidebar();
    expect(wrapper.find("aside").exists()).toBe(true);
  });

  it("affiche le bouton de deconnexion", () => {
    const wrapper = mountSidebar();
    expect(wrapper.find(".logout-btn").exists()).toBe(true);
  });
=======
// Tests de fumee
describe('Sidebar - Tests de fumee', () => {
  it('se monte sans erreur', () => {
    expect(() => mountSidebar()).not.toThrow()
  })

  it('rend un element <aside>', () => {
    const wrapper = mountSidebar()
    expect(wrapper.find('aside').exists()).toBe(true)
  })

  it('affiche le bouton de deconnexion', () => {
    const wrapper = mountSidebar()
    expect(wrapper.find('.logout-btn').exists()).toBe(true)
  })
>>>>>>> f631fb1e6bf4e352d9d8ebef2ec35dbe0244a48b

  it("affiche la navigation", () => {
    const wrapper = mountSidebar();
    expect(wrapper.find("nav").exists()).toBe(true);
  });

<<<<<<< HEAD
  it("accepte la propriete collapsed sans planter", () => {
    expect(() => mountSidebar({ collapsed: true })).not.toThrow();
  });
});
=======
  it('accepte la propriete collapsed sans planter', () => {
    expect(() => mountSidebar({ collapsed: true })).not.toThrow()
  })
})
>>>>>>> f631fb1e6bf4e352d9d8ebef2ec35dbe0244a48b
