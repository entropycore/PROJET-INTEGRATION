<<<<<<< HEAD
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createWebHistory } from 'vue-router'
import Sidebar from '../../../../components/dashboard/Sidebar.vue'

// Mocks
vi.mock('../../../../services/authService', () => ({
=======
import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import { createRouter, createWebHistory } from "vue-router";
import Sidebar from "../../../../components/dashboard/Sidebar.vue";

// ─── Mocks ───────────────────────────────────────────────────────────────────

// Mock dyal authService (b Relative Path bach y-overrida dakchi li wast Sidebar.vue)
vi.mock("../../../../services/authService", () => ({
>>>>>>> 3dce0a3e27749bbf804690e5e1c08da883d1e98c
  logout: vi.fn().mockResolvedValue(undefined),
}));

<<<<<<< HEAD
vi.mock('../../../../config/sidebarConfig', () => ({
=======
// Mock dyal sidebarConfig (b Relative Path kerdalik)
vi.mock("../../../../config/sidebarConfig", () => ({
>>>>>>> 3dce0a3e27749bbf804690e5e1c08da883d1e98c
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
// Stub des imports d'icones, car new URL(...).href n'existe pas dans jsdom.
vi.stubGlobal('URL', class {
  constructor(path) { this.href = `/mocked-icon/${path}` }
})
=======
// Stub des imports d'icônes (new URL(...).href n'existe pas dans jsdom)
vi.stubGlobal(
  "URL",
  class {
    constructor(path) {
      this.href = `/mocked-icon/${path}`;
    }
  },
);
>>>>>>> 3dce0a3e27749bbf804690e5e1c08da883d1e98c

// Routeur minimal
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: { template: "<div />" } },
    { path: "/dashboard", component: { template: "<div />" } },
    { path: "/login", component: { template: "<div />" } },
  ],
});

// Fonction de montage
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
=======
// ─── Tests smoke ─────────────────────────────────────────────────────────────

describe("Sidebar – smoke tests", () => {
  it("se monte sans erreur", () => {
    expect(() => mountSidebar()).not.toThrow();
  });

  it("rend un élément <aside>", () => {
    const wrapper = mountSidebar();
    expect(wrapper.find("aside").exists()).toBe(true);
  });

  it("affiche le bouton de déconnexion", () => {
    const wrapper = mountSidebar();
    expect(wrapper.find(".logout-btn").exists()).toBe(true);
  });
>>>>>>> 3dce0a3e27749bbf804690e5e1c08da883d1e98c

  it("affiche la navigation", () => {
    const wrapper = mountSidebar();
    expect(wrapper.find("nav").exists()).toBe(true);
  });

<<<<<<< HEAD
  it('accepte la propriete collapsed sans planter', () => {
    expect(() => mountSidebar({ collapsed: true })).not.toThrow()
  })
})
=======
  it("accepte la prop collapsed sans crasher", () => {
    expect(() => mountSidebar({ collapsed: true })).not.toThrow();
  });
});
>>>>>>> 3dce0a3e27749bbf804690e5e1c08da883d1e98c
