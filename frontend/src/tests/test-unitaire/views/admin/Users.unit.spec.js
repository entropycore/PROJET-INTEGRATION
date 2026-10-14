import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import Users from '@/views/admin/Users.vue';

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: { role: '' } }),
  useRouter: () => ({ push: vi.fn() })
}));

vi.mock('@/services/adminService', () => ({
  getAdminUsers: vi.fn(() => Promise.resolve({ data: { data: { items: [], pagination: {} } } }))
}));

describe('Users.vue - Tests unitaires', () => {
  // On monte le composant une seule fois pour tester ses fonctions
  const wrapper = mount(Users);
  const vm = wrapper.vm;

  it('fullName() - devrait concaténer correctement le prénom et le nom', () => {
    expect(vm.fullName({ firstName: 'Marc', lastName: 'Aurele' })).toBe('Marc Aurele');
    expect(vm.fullName({ firstName: '', lastName: 'Aurele' })).toBe('Aurele');
    expect(vm.fullName({})).toBe('');
  });

  it('initials() - devrait retourner les initiales en lettres majuscules', () => {
    expect(vm.initials({ firstName: 'lucas', lastName: 'bernard' })).toBe('LB');
    expect(vm.initials({ firstName: 'Thomas', lastName: '' })).toBe('T');
    expect(vm.initials({})).toBe('');
  });

  it('formatLastActive() - devrait calculer et renvoyer le bon texte de temps écoulé', () => {
    const maintenant = new Date();

    // Test Moins de 60 secondes
    const ilYaDixSecondes = new Date(maintenant.getTime() - 10 * 1000);
    expect(vm.formatLastActive(ilYaDixSecondes)).toBe("à l'instant");

    // Test Minutes
    const ilYaDixMinutes = new Date(maintenant.getTime() - 10 * 60 * 1000);
    expect(vm.formatLastActive(ilYaDixMinutes)).toBe("il y a 10 min");

    // Test Heures
    const ilYaDeuxHeures = new Date(maintenant.getTime() - 2 * 60 * 60 * 1000);
    expect(vm.formatLastActive(ilYaDeuxHeures)).toBe("il y a 2 h");

    // Test Jamais
    expect(vm.formatLastActive(null)).toBe("Jamais");
  });

  it('statusLabel() - devrait retourner le libellé propre au statut anglais/français', () => {
    expect(vm.statusLabel('ACTIVE')).toBe('Active');
    expect(vm.statusLabel('PENDING')).toBe('Pending');
    expect(vm.statusLabel('SUSPENDED')).toBe('Suspended');
    expect(vm.statusLabel('INACTIVE')).toBe('Inactive');
    expect(vm.statusLabel('AUTRE_CHOSE')).toBe('AUTRE_CHOSE'); // Fallback automatique
  });
});
