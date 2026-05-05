<script setup>
const props = defineProps({
  notification: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["read", "delete"]);

const typeConfig = {
  INFO: {
    label: "Information",
    class: "info",
  },
  VALIDATION: {
    label: "Validation",
    class: "validation",
  },
  ALERT: {
    label: "Alerte",
    class: "alert",
  },
};

const formatDate = (date) => {
  return new Date(date).toLocaleString("fr-FR");
};
</script>

<template>
  <article class="item" :class="{ unread: !notification.read }">
    <div class="content">
      <span
        class="type"
        :class="typeConfig[notification.type]?.class"
      >
        <span class="dot"></span>
        {{ typeConfig[notification.type]?.label || notification.type }}
      </span>

      <h3>{{ notification.title }}</h3>
      <p>{{ notification.message }}</p>

      <small>
        {{ formatDate(notification.createdAt) }}
      </small>
    </div>

    <div class="actions">
      <button
        v-if="!notification.read"
        class="icon-btn read"
        title="Marquer comme lu"
        @click="emit('read')"
      >
        ✓
      </button>

      <button
        class="icon-btn view"
        title="Voir"
      >
        👁
      </button>

      <button
        class="icon-btn delete"
        title="Supprimer"
        @click="emit('delete')"
      >
        🗑
      </button>
    </div>
  </article>
</template>

<style scoped>
.item {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 14px;
  padding: 16px 20px;
  background: #ffffff;
  border-radius: 18px;
  border-left: 4px solid transparent;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.045);
}

.item.unread {
  border-left-color: #d89a2b;
  background: linear-gradient(90deg, #fff8eb 0%, #ffffff 16%);
}

.content {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.type {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 11px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.type.info {
  background: #e8efed;
  color: #235963;
}

.type.validation {
  background: #eaf7f0;
  color: #1f7a5a;
}

.type.alert {
  background: #fdf2f2;
  color: #b42318;
}

h3 {
  margin: 0;
  color: #0f2f3a;
  font-size: 1rem;
  font-weight: 800;
}

p {
  margin: 0;
  color: #5f6f70;
  line-height: 1.45;
  font-size: 0.92rem;
}

small {
  color: #8b8f8c;
  font-size: 0.78rem;
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 12px;
  display: grid;
  place-items: center;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 800;
  transition: 0.2s ease;
}

.icon-btn:hover {
  transform: translateY(-1px);
}

.icon-btn.read {
  background: #ecfdf5;
  color: #059669;
}

.icon-btn.view {
  background: #e8efed;
  color: #235963;
}

.icon-btn.delete {
  background: #fef2f2;
  color: #dc2626;
}

@media (max-width: 800px) {
  .item {
    grid-template-columns: 1fr;
  }

  .actions {
    justify-content: flex-start;
  }
}
</style>