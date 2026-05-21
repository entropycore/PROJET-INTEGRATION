import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import NotificationList from '@/components/notifications/NotificationsList.vue';

describe('NotificationList - Smoke Test', () => {
  it('mounts successfully without crashing', () => {
    const wrapper = mount(NotificationList, {
      props: {
        notifications: [],
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});