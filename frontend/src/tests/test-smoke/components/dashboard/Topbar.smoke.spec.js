import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";
import { createPinia, setActivePinia } from "pinia";
import { defineComponent } from "vue";

<<<<<<< HEAD
// Mocks
vi.mock('../../assets/styles/topbar.css', () => ({}))
vi.mock('../../assets/icons/notification.svg', () => ({
  default: '/mock-notification.svg',
}))
vi.mock('../../assets/logo.png', () => ({
  default: '/mock-logo.png',
}))
vi.mock('../AppLogo.vue', () => ({
  default: defineComponent({ template: '<div />' }),
}))
vi.mock('@/stores/auth', () => ({
=======
// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("../../assets/styles/topbar.css", () => ({}));
vi.mock("../../assets/icons/notification.svg", () => ({
  default: "/mock-notification.svg",
}));
vi.mock("../../assets/logo.png", () => ({
  default: "/mock-logo.png",
}));
vi.mock("../AppLogo.vue", () => ({
  default: defineComponent({ template: "<div />" }),
}));
vi.mock("@/stores/auth", () => ({
>>>>>>> 3dce0a3e27749bbf804690e5e1c08da883d1e98c
  useAuthStore: vi.fn(),
}));

import { useAuthStore } from "@/stores/auth";
import Topbar from "@/components/dashboard/Topbar.vue";

// Fonctions d'aide
const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: "/:pathMatch(.*)*", component: { template: "<div />" } }],
});

function mountTopBar(user = null) {
  useAuthStore.mockReturnValue({ user });
  return mount(Topbar, {
    global: {
      plugins: [router],
      stubs: {
        RouterLink: {
          template: '<a :href="to"><slot /></a>',
          props: ["to"],
        },
      },
    },
  });
}

<<<<<<< HEAD
// Tests de fumee
describe('TopBar - Tests de fumee', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('se monte sans erreur avec un utilisateur null', () => {
    expect(() => mountTopBar(null)).not.toThrow()
  })
=======
// ─── Smoke Tests ──────────────────────────────────────────────────────────────

describe("TopBar — Smoke Tests", () => {
  beforeEach(() => setActivePinia(createPinia()));

  it("se monte sans erreur avec user null", () => {
    expect(() => mountTopBar(null)).not.toThrow();
  });
>>>>>>> 3dce0a3e27749bbf804690e5e1c08da883d1e98c

  it("se monte sans erreur avec un STUDENT", () => {
    expect(() =>
      mountTopBar({ role: "STUDENT", firstName: "Alice" }),
    ).not.toThrow();
  });

  it("se monte sans erreur avec un ADMINISTRATOR", () => {
    expect(() =>
      mountTopBar({ role: "ADMINISTRATOR", firstName: "Bob" }),
    ).not.toThrow();
  });

  it("se monte sans erreur avec un PROFESSOR", () => {
    expect(() =>
      mountTopBar({ role: "PROFESSOR", firstName: "Carlos" }),
    ).not.toThrow();
  });

  it("se monte sans erreur avec un PROFESSIONAL", () => {
    expect(() =>
      mountTopBar({ role: "PROFESSIONAL", firstName: "Diana" }),
    ).not.toThrow();
  });

<<<<<<< HEAD
  it('se monte sans erreur avec un role inconnu', () => {
    expect(() => mountTopBar({ role: 'UNKNOWN', firstName: 'Test' })).not.toThrow()
  })

  it('rend un element <header class="topbar">', () => {
    const wrapper = mountTopBar({ role: 'STUDENT', firstName: 'Alice' })
    expect(wrapper.find('header.topbar').exists()).toBe(true)
  })
=======
  it("se monte sans erreur avec un rôle inconnu", () => {
    expect(() =>
      mountTopBar({ role: "UNKNOWN", firstName: "Test" }),
    ).not.toThrow();
  });

  it('rend un élément <header class="topbar">', () => {
    const wrapper = mountTopBar({ role: "STUDENT", firstName: "Alice" });
    expect(wrapper.find("header.topbar").exists()).toBe(true);
  });
>>>>>>> 3dce0a3e27749bbf804690e5e1c08da883d1e98c

  it("contient la section topbar-left", () => {
    const wrapper = mountTopBar({ role: "STUDENT", firstName: "Alice" });
    expect(wrapper.find(".topbar-left").exists()).toBe(true);
  });

  it("contient la section topbar-right", () => {
    const wrapper = mountTopBar({ role: "STUDENT", firstName: "Alice" });
    expect(wrapper.find(".topbar-right").exists()).toBe(true);
  });

  it("rend le lien de notification", () => {
    const wrapper = mountTopBar({ role: "STUDENT", firstName: "Alice" });
    expect(wrapper.find(".notification-link").exists()).toBe(true);
  });

<<<<<<< HEAD
  it('rend le lien avatar', () => {
    const wrapper = mountTopBar({ role: 'STUDENT', firstName: 'Alice' })
    expect(wrapper.find('.avatar').exists()).toBe(true)
  })
})
=======
  it("rend le lien avatar", () => {
    const wrapper = mountTopBar({ role: "STUDENT", firstName: "Alice" });
    expect(wrapper.find(".avatar").exists()).toBe(true);
  });
});
>>>>>>> 3dce0a3e27749bbf804690e5e1c08da883d1e98c
