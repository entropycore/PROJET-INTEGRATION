<script setup>
import NotificationItem from "./NotificationItem.vue";

defineProps({
  notifications: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["read", "delete"]);
</script>

<template>
  <div class="list">
    <NotificationItem
      v-for="notification in notifications"
      :key="notification.id"
      :notification="notification"
      @read="emit('read', notification)"
      @delete="emit('delete', notification.id)"
    />

    <div v-if="notifications.length === 0" class="empty">
      Aucune notification trouvée.
    </div>
  </div>
</template>

<style scoped>
.list {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.empty {
  padding: 2rem;
  border-radius: var(--app-radius-panel);
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  box-shadow: var(--app-shadow-card);
  text-align: center;
  color: var(--app-muted);
  font-family: var(--app-font-body);
  font-size: var(--app-text-md);
}
</style>
