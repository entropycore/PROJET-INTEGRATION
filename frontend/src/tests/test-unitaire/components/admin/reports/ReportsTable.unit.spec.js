import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ReportsTable from '@/components/admin/reports/ReportsTable.vue'

describe('ReportsTable - Tests Unitaires', () => {
  it('doit formater correctement la date au style fr-FR', () => {
    const wrapper = mount(ReportsTable, {
      props: {
        reports: [{
          id: 1,
          reason: 'Spam',
          description: 'Test de description',
          targetType: 'PROJECT',
          reportedBy: { fullName: 'Utilisateur Test', email: 'user@test.com' },
          status: 'PENDING',
          createdAt: '2026-05-21T14:30:00.000Z'
        }]
      }
    })

    const dateCell = wrapper.find('.date-cell').text()
    
    // Vérifie que la cellule contient bien la date formatée en français
    expect(dateCell).toContain('21 mai 2026')
  })
})
