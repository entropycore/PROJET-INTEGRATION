import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Validations from '@/views/admin/Validations.vue';

vi.mock('@/components/admin/validations/ValidationStats.vue', () => ({
  default: { template: '<div class="stats-mock"></div>' },
}));

vi.mock('@/components/admin/validations/ValidationToolbar.vue', () => ({
  default: { template: '<div class="toolbar-mock"></div>' },
}));

vi.mock('@/components/admin/validations/ValidationDetailsModal.vue', () => ({
  default: {
    name: 'ValidationDetailsModal',
    props: ['validation'],
    template: '<div class="modal-mock"></div>',
  },
}));

vi.mock('@/components/admin/validations/ValidationsTable.vue', () => ({
  default: {
    props: ['validations'],
    template: `
      <div class="table-mock">
        <button class="view-btn-mock" @click="$emit('view', validations[0])">Voir premier</button>
      </div>
    `,
  },
}));

describe('Validations.vue - Tests UI et integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('devrait filtrer dynamiquement les validations selon la recherche', async () => {
    const wrapper = mount(Validations);

    expect(wrapper.vm.filteredValidations.length).toBe(4);

    wrapper.vm.search = 'Yassine';
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.filteredValidations.length).toBe(1);
    expect(wrapper.vm.filteredValidations[0].student.fullName).toBe('Yassine K.');
  });

  it("devrait ouvrir la modale de details lors de la reception de l'evenement view", async () => {
    const wrapper = mount(Validations);

    expect(wrapper.find('.modal-mock').exists()).toBe(false);

    await wrapper.find('.view-btn-mock').trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.showDetailsModal).toBe(true);
    expect(wrapper.vm.selectedValidation).not.toBeNull();
    expect(wrapper.vm.selectedValidation.id).toBe(1);
    expect(wrapper.find('.modal-mock').exists()).toBe(true);
  });
});
