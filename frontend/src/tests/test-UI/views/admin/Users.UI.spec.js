import { mount, flushPromises } from '@vue/test-utils'; // <-- Ajout de flushPromises ici
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Users from '@/views/admin/Users.vue';
import { useRoute } from 'vue-router';

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({ query: { role: '' } })),
  useRouter: () => ({ push: vi.fn() })
}));

vi.mock('@/services/adminService', () => ({
  getAdminUsers: vi.fn(() => Promise.resolve({
    data: {
      data: {
        items: [
          { 
            id: 1, 
            firstName: 'John', 
            lastName: 'Doe', 
            email: 'john@example.com', 
            accountStatus: 'ACTIVE', 
            role: 'STUDENT' 
          }
        ],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
      }
    }
  })),
  deleteUser: vi.fn(),
  approveProfessionalRequest: vi.fn(),
  rejectProfessionalRequest: vi.fn()
}));

describe('Users.vue - Tests UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait adapter dynamiquement les colonnes du tableau pour un Étudiant', async () => {
    // Simulation de l'URL ?role=STUDENT
    vi.mocked(useRoute).mockReturnValue({ query: { role: 'STUDENT' } });
    
    const wrapper = mount(Users);
    
    // CORRECTION : On attend que l'API réponde et que le tableau s'affiche
    await flushPromises(); 

    const headers = wrapper.findAll('th').map(th => th.text());
    
    expect(wrapper.find('h1').text()).toBe('Gestion des étudiants');
    expect(headers).toContain('Major');
    expect(headers).toContain('Level');
    expect(headers).not.toContain('Company');
  });

  it('devrait ouvrir et fermer le menu action lors du clic', async () => {
    vi.mocked(useRoute).mockReturnValue({ query: { role: '' } });
    
    const wrapper = mount(Users);
    
    // CORRECTION : On attend que l'utilisateur fictif soit chargé pour voir apparaître le bouton
    await flushPromises(); 

    // Au départ, le menu déroulant est masqué
    expect(wrapper.find('.actions-dropdown-menu').exists()).toBe(false);

    // Premier clic sur le bouton de déclenchement (icône menu.svg)
    const triggerBtn = wrapper.find('.actions-trigger');
    await triggerBtn.trigger('click');

    // Le menu doit s'ouvrir
    expect(wrapper.find('.actions-dropdown-menu').exists()).toBe(true);
    expect(wrapper.find('.actions-dropdown-menu').text()).toContain('Voir');

    // Second clic sur le bouton
    await triggerBtn.trigger('click');
    
    // Le menu doit se refermer
    expect(wrapper.find('.actions-dropdown-menu').exists()).toBe(false);
  });
});
