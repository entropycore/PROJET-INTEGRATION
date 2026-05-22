import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";
import { createPinia, setActivePinia } from "pinia";
import { defineComponent } from "vue";

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
  useAuthStore: vi.fn(),
}));

import { useAuthStore } from "@/stores/auth";
import Topbar from "@/components/dashboard/Topbar.vue";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Smoke Tests ──────────────────────────────────────────────────────────────

describe("TopBar — Smoke Tests", () => {
  beforeEach(() => setActivePinia(createPinia()));

  it("se monte sans erreur avec user null", () => {
    expect(() => mountTopBar(null)).not.toThrow();
  });

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

  it("se monte sans erreur avec un rôle inconnu", () => {
    expect(() =>
      mountTopBar({ role: "UNKNOWN", firstName: "Test" }),
    ).not.toThrow();
  });

  it('rend un élément <header class="topbar">', () => {
    const wrapper = mountTopBar({ role: "STUDENT", firstName: "Alice" });
    expect(wrapper.find("header.topbar").exists()).toBe(true);
  });

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

  it("rend le lien avatar", () => {
    const wrapper = mountTopBar({ role: "STUDENT", firstName: "Alice" });
    expect(wrapper.find(".avatar").exists()).toBe(true);
  });
});
