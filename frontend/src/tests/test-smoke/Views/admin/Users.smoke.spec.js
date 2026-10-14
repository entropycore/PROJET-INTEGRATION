import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Users from '@/views/admin/Users.vue';
import { getAdminUsers } from '@/services/adminService';

// Mock des dépendances de routage et de services
vi.mock('vue-router', () => ({
  useRoute: () => ({ query: { role: '' } }),
  useRouter: () => ({ push: vi.fn() })
}));

vi.mock('@/services/adminService', () => ({
  getAdminUsers: vi.fn(() => Promise.resolve({ data: { data: { items: [], pagination: {} } } })),
  deleteUser: vi.fn(),
  approveProfessionalRequest: vi.fn(),
  rejectProfessionalRequest: vi.fn()
}));

describe('Users.vue - Test de fumee', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait monter le composant avec succès et afficher le titre par défaut', async () => {
    const wrapper = mount(Users);
    
    // Vérifie que le composant est bien instancié
    expect(wrapper.exists()).toBe(true);
    
    // Vérifie la présence du titre principal par défaut
    expect(wrapper.find('h1').text()).toBe('Gestion des utilisateurs');
    
    // Vérifie que l'appel API initial au montage a été déclenché
    expect(getAdminUsers).toHaveBeenCalledTimes(1);
  });
});
