import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import Validations from '@/views/admin/Validations.vue';

// On mocke les sous-composants pour éviter d'importer toute leur logique interne
vi.mock('@/components/admin/validations/ValidationStats.vue', () => ({ default: { name: 'ValidationStats', template: '<div></div>' } }));
vi.mock('@/components/admin/validations/ValidationToolbar.vue', () => ({ default: { name: 'ValidationToolbar', template: '<div></div>' } }));
vi.mock('@/components/admin/validations/ValidationsTable.vue', () => ({ default: { name: 'ValidationsTable', template: '<div></div>' } }));
vi.mock('@/components/admin/validations/ValidationDetailsModal.vue', () => ({ default: { name: 'ValidationDetailsModal', template: '<div></div>' } }));

describe('Validations.vue - Test de fumee', () => {
  it('devrait monter le composant de gestion des validations sans planter', () => {
    const wrapper = mount(Validations);
    
    // Vérification de la présence du composant racine
    expect(wrapper.exists()).toBe(true);
    
    // Vérification du rendu textuel clé du header
    expect(wrapper.find('h1').text()).toBe('Centre de validations');
    expect(wrapper.find('.page-header p').text()).toBe('Examinez et validez les soumissions des étudiants');
  });
});
