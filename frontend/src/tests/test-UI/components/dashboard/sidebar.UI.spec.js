import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { logout } from "@/services/authService";
import Sidebar from "@/components/dashboard/Sidebar.vue";

vi.mock("@/services/authService", () => ({
  logout: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/config/sidebarConfig", () => ({
  sidebarConfig: {
    admin: [
      {
        section: "Principal",
        items: [
          { label: "Tableau de bord", path: "/dashboard", icon: "dashboard.svg" },
          {
            label: "Gestion utilisateurs",
            icon: "users.svg",
            children: [
              { label: "Liste", path: "/users/list", icon: "list.svg" },
              { label: "Invitations", path: "/users/invite", icon: "invite.svg" },
            ],
          },
        ],
      },
    ],
  },
}));

vi.stubGlobal(
  "URL",
  class {
    constructor(path) {
      this.href = `/mocked-icon/${path}`;
    }
  },
);

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: { template: "<div />" } },
    { path: "/dashboard", component: { template: "<div />" } },
    { path: "/users/list", component: { template: "<div />" } },
    { path: "/users/invite", component: { template: "<div />" } },
    { path: "/login", component: { template: "<div />" } },
  ],
});

const mountSidebar = (props = {}, userOverride = {}) => {
  const defaultUser = { firstName: "Alice", lastName: "Dupont", role: "admin" };
  return mount(Sidebar, {
    props,
    global: {
      plugins: [
        createTestingPinia({
          initialState: { auth: { user: { ...defaultUser, ...userOverride } } },
          stubActions: false,
        }),
        router,
      ],
      stubs: {
        RouterLink: {
          template: '<a :href="to"><slot /></a>',
          props: ["to"],
        },
      },
    },
  });
};

describe("Sidebar - Tests UI", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe("Bloc utilisateur", () => {
    it("affiche l'initiale de l'utilisateur dans l'avatar", () => {
      const wrapper = mountSidebar();
      expect(wrapper.find(".sidebar-avatar").text()).toBe("A");
    });

    it("affiche le prenom, le nom et le role", () => {
      const wrapper = mountSidebar();
      const info = wrapper.find(".sidebar-user-info");
      expect(info.text()).toContain("Alice");
      expect(info.text()).toContain("Dupont");
      expect(info.find("p").text()).toBe("admin");
    });
  });

  describe("Navigation", () => {
    it("affiche les liens et le dropdown", () => {
      const wrapper = mountSidebar();
      expect(wrapper.find(".sidebar-section").text()).toBe("Principal");
      expect(wrapper.text()).toContain("Tableau de bord");
      expect(wrapper.find(".sidebar-dropdown-trigger").text()).toContain(
        "Gestion utilisateurs",
      );
      expect(wrapper.find(".sidebar-submenu").exists()).toBe(false);
    });

    it("rend les liens simples (sans enfants)", () => {
      const wrapper = mountSidebar();
      const links = wrapper.findAll("a");
      const labels = links.map((l) => l.text());
      expect(labels.some((t) => t.includes("Tableau de bord"))).toBe(true);
    });

    it("rend le bouton dropdown pour les items avec enfants", () => {
      const wrapper = mountSidebar();
      const triggers = wrapper.findAll(".sidebar-dropdown-trigger");
      expect(triggers.length).toBeGreaterThan(0);
      expect(triggers[0].text()).toContain("Gestion utilisateurs");
    });

    it("n'affiche pas le sous-menu avant d'ouvrir le dropdown", () => {
      const wrapper = mountSidebar();
      expect(wrapper.find(".sidebar-submenu").exists()).toBe(false);
    });
  });

  describe("Dropdown", () => {
    it("ouvre le sous-menu au clic sur le trigger", async () => {
      const wrapper = mountSidebar();
      await wrapper.find(".sidebar-dropdown-trigger").trigger("click");
      expect(wrapper.find(".sidebar-submenu").exists()).toBe(true);
    });

    it("affiche les liens enfants une fois le sous-menu ouvert", async () => {
      const wrapper = mountSidebar();
      await wrapper.find(".sidebar-dropdown-trigger").trigger("click");
      const subLinks = wrapper.findAll(".sidebar-sublink");
      expect(subLinks.length).toBe(2);
    });

    it("ferme le sous-menu au second clic (toggle)", async () => {
      const wrapper = mountSidebar();
      const trigger = wrapper.find(".sidebar-dropdown-trigger");
      await trigger.trigger("click");
      await trigger.trigger("click");
      expect(wrapper.find(".sidebar-submenu").exists()).toBe(false);
    });

    it("change le chevron selon l'état ouvert/fermé", async () => {
      const wrapper = mountSidebar();
      const trigger = wrapper.find(".sidebar-dropdown-trigger");
      const chevronClosed = wrapper.find(".sidebar-chevron").text();

      await trigger.trigger("click");
      expect(wrapper.find(".sidebar-submenu").exists()).toBe(true);
      expect(wrapper.findAll(".sidebar-sublink")).toHaveLength(2);
      expect(wrapper.find(".sidebar-chevron").text()).not.toBe(chevronClosed);

      await trigger.trigger("click");
      expect(wrapper.find(".sidebar-submenu").exists()).toBe(false);
    });
  });

  describe("Propriete collapsed", () => {
    it("gere la classe collapsed et l'evenement toggle-sidebar", async () => {
      const collapsedWrapper = mountSidebar({ collapsed: true });
      expect(collapsedWrapper.find("aside").classes()).toContain(
        "sidebar-collapsed",
      );

      const wrapper = mountSidebar();
      expect(wrapper.find("aside").classes()).not.toContain("sidebar-collapsed");
      await wrapper.find(".sidebar-collapse-btn").trigger("click");
      expect(wrapper.emitted("toggle-sidebar")).toBeTruthy();
    });
  });

  describe("Deconnexion", () => {
    it("appelle logout(), vide la session et redirige vers /login", async () => {
      const wrapper = mountSidebar();
      const authStore = useAuthStore();

      await wrapper.find(".logout-btn").trigger("click");
      await flushPromises();

      expect(logout).toHaveBeenCalledOnce();
      expect(authStore.user).toBeNull();
      expect(router.currentRoute.value.path).toBe("/login");
    });

    it("redirige quand logout() rejette", async () => {
      logout.mockRejectedValueOnce(new Error("network error"));
      const wrapper = mountSidebar();

      await wrapper.find(".logout-btn").trigger("click");
      await flushPromises();

      expect(router.currentRoute.value.path).toBe("/login");
    });
  });

  describe("Sections par role", () => {
    it("n'affiche aucune section si le role est inconnu", () => {
      const wrapper = mountSidebar({}, { role: "unknown_role" });
      expect(wrapper.findAll(".sidebar-section")).toHaveLength(0);
    });
  });
});
