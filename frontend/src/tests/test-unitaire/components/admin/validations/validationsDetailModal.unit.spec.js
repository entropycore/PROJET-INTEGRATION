import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ValidationDetailsModal from '@/components/admin/validations/ValidationDetailsModal.vue'

const baseValidation = {
  id: 1,
  targetType: 'INTERNSHIP',
  title: 'Stage web',
  description: 'Stage developpement web',
  student: {
    fullName: 'Meryem A.',
    email: 'meryem@example.com',
  },
  targetDetails: {
    company: 'InnovTech',
    startDate: '2026-06-01',
    endDate: '2026-08-31',
  },
}

describe('ValidationDetailsModal - Tests unitaires', () => {
  it('affiche les details du stage', () => {
    const wrapper = mount(ValidationDetailsModal, {
      props: { validation: baseValidation },
    })

    expect(wrapper.text()).toContain('Stage web')
    expect(wrapper.text()).toContain('InnovTech')
    expect(wrapper.text()).toContain('Meryem A.')
  })

  it('affiche un message quand aucun fichier n est fourni', () => {
    const wrapper = mount(ValidationDetailsModal, {
      props: { validation: baseValidation },
    })

    expect(wrapper.find('.no-files').exists()).toBe(true)
    expect(wrapper.text()).toContain('Aucun fichier')
  })
})
