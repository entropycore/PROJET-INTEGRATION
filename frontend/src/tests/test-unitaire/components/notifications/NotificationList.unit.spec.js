import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import NotificationList from '@/components/notifications/NotificationsList.vue';
import NotificationItem from '@/components/notifications/NotificationItem.vue';

describe('NotificationList - Test unitaire', () => {
  it('affiche un NotificationItem pour chaque notification', () => {
    const notifications = [
      { id: 1, title: 'Notif 1' },
      { id: 2, title: 'Notif 2' },
    ];

    const wrapper = shallowMount(NotificationList, {
      props: { notifications },
    });

    const items = wrapper.findAllComponents(NotificationItem);

    expect(items.length).toBe(2);
  });

  it('affiche le message vide quand la liste des notifications est vide', () => {
    const wrapper = shallowMount(NotificationList, {
      props: {
        notifications: [],
      },
    });

    expect(wrapper.text()).toContain('Aucune notification trouvée.');
  });
});
