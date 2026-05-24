import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import NotificationList from '@/components/notifications/NotificationsList.vue';

describe('NotificationList - Test de fumee', () => {
  it('monte le composant avec succes sans planter', () => {
    const wrapper = mount(NotificationList, {
      props: {
        notifications: [],
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});
