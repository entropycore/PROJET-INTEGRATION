import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ValidationsTable from '@/components/admin/validations/ValidationsTable.vue'

const mountTable = (overrides = {}) =>
  mount(ValidationsTable, {
    props: {
      validations: [
        {
          id: 1,
          title: 'Certification AWS',
          description: 'Certificat cloud',
          targetType: 'CERTIFICATE',
          status: 'APPROVED',
          submittedAt: '2026-05-21T14:30:00.000Z',
          student: {
            fullName: 'Reda M.',
            email: 'reda@example.com',
          },
          ...overrides,
        },
      ],
    },
  })

describe('ValidationsTable - Tests unitaires', () => {
  it('traduit le type et le statut', () => {
    const wrapper = mountTable()

    expect(wrapper.text()).toContain('Certificat')
    expect(wrapper.text()).toContain('Approuv')
  })

  it('formate la date de soumission', () => {
    const wrapper = mountTable()

    expect(wrapper.find('.date-cell').text()).toContain('2026')
  })
})
