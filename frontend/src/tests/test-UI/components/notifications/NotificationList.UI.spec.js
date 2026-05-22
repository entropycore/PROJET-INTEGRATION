import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import NotificationList from '@/components/notifications/NotificationsList.vue';

describe('NotificationList - UI Test', () => {
  it('emits read event when NotificationItem emits read', async () => {
    const notifications = [
      { id: 1, title: 'Test notification' },
    ];

    const wrapper = mount(NotificationList, {
      props: { notifications },
      global: {
        stubs: {
          NotificationItem: {
            template: '<button @click="$emit(\'read\')">Read</button>',
          },
        },
      },
    });

    await wrapper.find('button').trigger('click');

    expect(wrapper.emitted('read')).toBeTruthy();
    expect(wrapper.emitted('read')?.length).toBe(1);
  });

  it('emits delete event with notification id', async () => {
    const notifications = [
      { id: 7, title: 'Delete me' },
    ];

    const wrapper = mount(NotificationList, {
      props: { notifications },
      global: {
        stubs: {
          NotificationItem: {
            template: '<button @click="$emit(\'delete\')">Delete</button>',
          },
        },
      },
    });

    await wrapper.find('button').trigger('click');

    expect(wrapper.emitted('delete')).toBeTruthy();
    expect(wrapper.emitted('delete')?.[0]).toEqual([7]);
  });
});
