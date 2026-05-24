import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Validations from '@/views/admin/Validations.vue';

describe('Validations.vue - Tests unitaires', () => {
  let wrapper;

  beforeEach(() => {
    vi.restoreAllMocks();
    wrapper = mount(Validations);
  });

  it("updateValidationStatus() - devrait modifier correctement l'etat d'une validation", () => {
    expect(wrapper.vm.validations[0].status).toBe('PENDING');

    wrapper.vm.updateValidationStatus(1, 'APPROVED');

    expect(wrapper.vm.validations[0].status).toBe('APPROVED');
  });

  it("handleApprove() - devrait passer le statut a APPROVED si l'utilisateur confirme", async () => {
    const spyConfirm = vi.spyOn(window, 'confirm').mockImplementation(() => true);

    await wrapper.vm.handleApprove(wrapper.vm.validations[0]);

    expect(spyConfirm).toHaveBeenCalled();
    expect(wrapper.vm.validations[0].status).toBe('APPROVED');
  });

  it('handleReject() - devrait modifier le statut en REJECTED si un motif est saisi', async () => {
    const spyPrompt = vi
      .spyOn(window, 'prompt')
      .mockImplementation(() => 'Document illisible ou incomplet.');

    await wrapper.vm.handleReject(wrapper.vm.validations[1]);

    expect(spyPrompt).toHaveBeenCalled();
    expect(wrapper.vm.validations[1].status).toBe('REJECTED');
  });

  it('handleRequestChanges() - devrait demander des corrections si un motif est fourni', async () => {
    const spyPrompt = vi
      .spyOn(window, 'prompt')
      .mockImplementation(() => 'Merci de joindre un justificatif au format officiel.');

    await wrapper.vm.handleRequestChanges(wrapper.vm.validations[2]);

    expect(spyPrompt).toHaveBeenCalled();
    expect(wrapper.vm.validations[2].status).toBe('CHANGES_REQUESTED');
  });
});
