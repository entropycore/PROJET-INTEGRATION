import { flushPromises, mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import Validations from '@/views/admin/Validations.vue';

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
}));

vi.mock('@/services/adminValidationsApi', () => ({
  getPendingValidations: vi.fn(() => Promise.resolve({ items: [] })),
  getPendingValidationsCount: vi.fn(() =>
    Promise.resolve({ count: 0, projects: 0, internships: 0, certificates: 0, activities: 0 }),
  ),
  getValidationDetails: vi.fn(),
  approveValidation: vi.fn(),
  rejectValidation: vi.fn(),
  requestValidationChanges: vi.fn(),
}));

vi.mock('@/components/admin/validations/ValidationStats.vue', () => ({ default: { name: 'ValidationStats', template: '<div></div>' } }));
vi.mock('@/components/admin/validations/ValidationToolbar.vue', () => ({ default: { name: 'ValidationToolbar', template: '<div></div>' } }));
vi.mock('@/components/admin/validations/ValidationsTable.vue', () => ({ default: { name: 'ValidationsTable', template: '<div></div>' } }));
vi.mock('@/components/admin/validations/ValidationDetailsModal.vue', () => ({ default: { name: 'ValidationDetailsModal', template: '<div></div>' } }));

describe('Validations.vue - Test de fumee', () => {
  it('devrait monter le composant de gestion des validations sans planter', async () => {
    const wrapper = mount(Validations);
    await flushPromises();

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('h1').text()).toBe('Centre de validations');
    expect(wrapper.find('.page-header p').text()).toBe('Examinez et validez les soumissions des étudiants');
  });
});
