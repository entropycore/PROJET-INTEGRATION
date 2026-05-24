import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { logout } from '@/services/authService'
import Sidebar from '@/components/dashboard/Sidebar.vue'


vi.mock('@/services/authService', () => ({
  logout: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/config/sidebarConfig', () => ({
  sidebarConfig: {
    admin: [
      {
        section: 'Principal',
        items: [
          { label: 'Tableau de bord', path: '/dashboard', icon: 'dashboard.svg' },
          {
            label: 'Gestion utilisateurs',
            icon: 'users.svg',
            children: [
              { label: 'Liste', path: '/users/list', icon: 'list.svg' },
              { label: 'Invitations', path: '/users/invite', icon: 'invite.svg' },
            ],
          },
        ],
      },
    ],
  },
}))

vi.stubGlobal('URL', class {
  constructor(path) { this.href = `/mocked-icon/${path}` }
})

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/dashboard', component: { template: '<div />' } },
    { path: '/users/list', component: { template: '<div />' } },
    { path: '/users/invite', component: { template: '<div />' } },
    { path: '/login', component: { template: '<div />' } },
  ],
})

const mountSidebar = (props = {}, userOverride = {}) => {
  const defaultUser = { firstName: 'Alice', lastName: 'Dupont', role: 'admin' }
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
        // RouterLink stub qui rend le href pour qu'on puisse l'inspecter
        RouterLink: {
          template: '<a :href="to"><slot /></a>',
          props: ['to'],
        },
      },
    },
  })
}

describe('Sidebar - Tests UI', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      configurable: true,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  describe('Bloc utilisateur', () => {
    it("affiche l'initiale de l'utilisateur dans l'avatar", () => {
      const wrapper = mountSidebar()
      expect(wrapper.find('.sidebar-avatar').text()).toBe('A')
    })

    it('affiche le prénom et le nom complets', () => {
      const wrapper = mountSidebar()
      const info = wrapper.find('.sidebar-user-info')
      expect(info.text()).toContain('Alice')
      expect(info.text()).toContain('Dupont')
    })

    it('affiche le rôle de l\'utilisateur', () => {
      const wrapper = mountSidebar()
      expect(wrapper.find('.sidebar-user-info p').text()).toBe('admin')
    })

    it("affiche 'A' comme initiale de secours si firstName est absent", () => {
      const wrapper = mountSidebar({}, { firstName: undefined })
      expect(wrapper.find('.sidebar-avatar').text()).toBe('A')
    })
  })

  describe('Navigation', () => {
    it('affiche le titre de section', () => {
      const wrapper = mountSidebar()
      expect(wrapper.find('.sidebar-section').text()).toBe('Principal')
    })

    it('rend les liens simples (sans enfants)', () => {
      const wrapper = mountSidebar()
      const links = wrapper.findAll('a')
      const labels = links.map((l) => l.text())
      expect(labels.some((t) => t.includes('Tableau de bord'))).toBe(true)
    })

    it('rend le bouton de menu deroulant pour les elements avec enfants', () => {
      const wrapper = mountSidebar()
      const triggers = wrapper.findAll('.sidebar-dropdown-trigger')
      expect(triggers.length).toBeGreaterThan(0)
      expect(triggers[0].text()).toContain('Gestion utilisateurs')
    })

    it("n'affiche pas le sous-menu avant d'ouvrir le menu deroulant", () => {
      const wrapper = mountSidebar()
      expect(wrapper.find('.sidebar-submenu').exists()).toBe(false)
    })
  })


  describe('Menu deroulant', () => {
    it('ouvre le sous-menu au clic sur le declencheur', async () => {
      const wrapper = mountSidebar()
      await wrapper.find('.sidebar-dropdown-trigger').trigger('click')
      expect(wrapper.find('.sidebar-submenu').exists()).toBe(true)
    })

    it('affiche les liens enfants une fois le sous-menu ouvert', async () => {
      const wrapper = mountSidebar()
      await wrapper.find('.sidebar-dropdown-trigger').trigger('click')
      const subLinks = wrapper.findAll('.sidebar-sublink')
      expect(subLinks.length).toBe(2)
    })

    it('ferme le sous-menu au second clic', async () => {
      const wrapper = mountSidebar()
      const trigger = wrapper.find('.sidebar-dropdown-trigger')
      await trigger.trigger('click')
      await trigger.trigger('click')
      expect(wrapper.find('.sidebar-submenu').exists()).toBe(false)
    })

    it("change le chevron selon l'état ouvert/fermé", async () => {
      const wrapper = mountSidebar()
      const trigger = wrapper.find('.sidebar-dropdown-trigger')
      const chevronClosed = wrapper.find('.sidebar-chevron').text()
      await trigger.trigger('click')
      const chevronOpen = wrapper.find('.sidebar-chevron').text()
      expect(chevronClosed).not.toBe(chevronOpen)
    })
  })

  describe('Propriete collapsed', () => {
    it("ajoute la classe 'sidebar-collapsed' quand collapsed=true", () => {
      const wrapper = mountSidebar({ collapsed: true })
      expect(wrapper.find('aside').classes()).toContain('sidebar-collapsed')
    })

    it("n'a pas la classe 'sidebar-collapsed' par défaut", () => {
      const wrapper = mountSidebar()
      expect(wrapper.find('aside').classes()).not.toContain('sidebar-collapsed')
    })

    it("émet 'toggle-sidebar' au clic sur le bouton collapse", async () => {
      const wrapper = mountSidebar()
      await wrapper.find('.sidebar-collapse-btn').trigger('click')
      expect(wrapper.emitted('toggle-sidebar')).toBeTruthy()
    })
  })


  describe('Déconnexion', () => {
    it('appelle logout() et redirige vers /login', async () => {
      const wrapper = mountSidebar()
      await wrapper.find('.logout-btn').trigger('click')
      await flushPromises()
      expect(logout).toHaveBeenCalledOnce()
      expect(router.currentRoute.value.path).toBe('/login')
    })

    it('vide la session auth après déconnexion', async () => {
      const wrapper = mountSidebar()
      const authStore = useAuthStore()
      await wrapper.find('.logout-btn').trigger('click')
      await flushPromises()
      expect(logout).toHaveBeenCalledOnce()
      expect(authStore.user).toBeNull()
    })

    it('redirige quand logout() rejette (résistance aux erreurs)', async () => {
      logout.mockRejectedValueOnce(new Error('erreur reseau'))
      const wrapper = mountSidebar()
      await wrapper.find('.logout-btn').trigger('click')
      await flushPromises()
      expect(router.currentRoute.value.path).toBe('/login')
    })
  })


  describe('Sections par rôle', () => {
    it("n'affiche aucune section si le rôle est inconnu", () => {
      const wrapper = mountSidebar({}, { role: 'unknown_role' })
      expect(wrapper.findAll('.sidebar-section').length).toBe(0)
    })
  })
})
