import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Validations from '@/views/admin/Validations.vue';

vi.mock('@/components/admin/validations/ValidationToolbar.vue', () => ({
  default: {
    name: 'ValidationToolbar',
    props: ['search', 'selectedType', 'selectedStatus'],
    emits: ['update:search', 'update:selectedType', 'update:selectedStatus'],
    template: `
      <div class="toolbar-mock">
        <input
          class="search-input-mock"
          :value="search"
          @input="$emit('update:search', $event.target.value)"
        />
        <select
          class="type-select-mock"
          :value="selectedType"
          @change="$emit('update:selectedType', $event.target.value)"
        >
          <option value="ALL">ALL</option>
          <option value="PROJECT">PROJECT</option>
        </select>
      </div>
    `,
  },
}));

vi.mock('@/components/admin/validations/ValidationStats.vue', () => ({
  default: {
    name: 'ValidationStats',
    props: ['stats'],
    template: '<div class="stats-mock"></div>',
  },
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
    name: 'ValidationsTable',
    props: ['validations'],
    template: `
      <div class="table-mock">
        <span class="row-count">{{ validations.length }}</span>
        <button v-if="validations.length > 0" class="view-btn-mock" @click="$emit('view', validations[0])">
          Voir premier
        </button>
      </div>
    `,
  },
}));

describe('Validations.vue - Tests UI', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('devrait filtrer les validations via la barre de recherche', async () => {
    const wrapper = mount(Validations);

    expect(wrapper.find('.row-count').text()).toBe('4');

    const input = wrapper.find('.search-input-mock');
    input.element.value = 'Yassine';
    await input.trigger('input');
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.row-count').text()).toBe('1');
  });

  it('devrait ouvrir la modale de details lors du clic sur voir', async () => {
    const wrapper = mount(Validations);

    expect(wrapper.find('.modal-mock').exists()).toBe(false);

    await wrapper.find('.view-btn-mock').trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.modal-mock').exists()).toBe(true);
    expect(wrapper.vm.selectedValidation).not.toBeNull();
    expect(wrapper.vm.selectedValidation.id).toBe(1);
    expect(wrapper.vm.selectedValidation.student.fullName).toBe('Yassine K.');
  });
});
