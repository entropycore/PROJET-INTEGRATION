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
  gap: 14px;
}

.empty {
  padding: 28px;
  border-radius: 18px;
  background: #fbfaf7;
  border: 1px solid #e5e0d8;
  text-align: center;
  color: #6b7280;
}
</style>