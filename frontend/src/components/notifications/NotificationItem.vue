<script setup>
const props = defineProps({
  notification: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["read", "delete"]);

const typeClassByType = {
  INFO: "info",
  SYSTEM: "system",
  VALIDATION: "validation",
  CERTIFICATE_VALIDATION: "validation",
  RECOMMENDATION_LETTER_VALIDATION: "validation",
  COMMENT_VALIDATION: "validation",
  RECOMMENDATION_VALIDATION: "validation",
  ACCESS_REQUEST: "info",
  ACCESS_REQUEST_APPROVED: "info",
  ALERT: "alert",
  REPORT: "alert",
};

const typeLabelByType = {
  INFO: "Information",
  SYSTEM: "Système",
  VALIDATION: "Validation",
  CERTIFICATE_VALIDATION: "Validation",
  RECOMMENDATION_LETTER_VALIDATION: "Validation",
  COMMENT_VALIDATION: "Validation",
  RECOMMENDATION_VALIDATION: "Validation",
  ACCESS_REQUEST: "Inscription",
  ACCESS_REQUEST_APPROVED: "Inscription",
  ALERT: "Alerte",
  REPORT: "Rapport",
};

const getTypeClass = (type) => {
  return typeClassByType[type] || "system";
};

const getTypeLabel = (type) => {
  return typeLabelByType[type] || type;
};

const formatDate = (date) => {
  const created = new Date(date);

  return created.toLocaleDateString("fr-FR");
};
</script>

<template>
  <article
    class="item"
    :class="[getTypeClass(notification.type), { unread: !notification.read }]"
  >
    <div class="content">
      <div class="title-row">
        <span class="type-dot"></span>
        <span class="type" :class="getTypeClass(notification.type)">
          {{ getTypeLabel(notification.type) }}
        </span>
        <h3>{{ notification.title }}</h3>
      </div>

      <p>{{ notification.message }}</p>

      <small>
        {{ formatDate(notification.createdAt) }}
      </small>
    </div>

    <div class="actions">
      <button
        v-if="!notification.read"
        class="action-btn icon-btn read"
        type="button"
        @click="emit('read')"
      >
        Marquer lu
      </button>

      <button
        class="action-btn icon-btn delete"
        type="button"
        @click="emit('delete')"
      >
        Supprimer
      </button>
    </div>
  </article>
</template>

<style scoped>
.item {
  --notif-color: var(--app-secondary);

  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: center;

  padding: 0.9rem 1rem;

  background: var(--app-surface);

  border: 1px solid var(--app-border);
  border-left: 0.32rem solid transparent;
  border-radius: var(--app-radius-card);

  font-family: var(--app-font-body);

  box-shadow: 0 0.2rem 0.7rem rgba(47, 87, 93, 0.025);

  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    border-left-color 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease,
    transform 0.2s ease;
}

.item.validation {
  --notif-color: var(--app-primary);
}

.item.alert {
  --notif-color: var(--app-error);
}

.item.info,
.item.system {
  --notif-color: var(--app-secondary);
}

.item.unread {
  border-left-color: var(--notif-color);
  border-color: color-mix(in srgb, var(--notif-color) 20%, var(--app-border));
  box-shadow: 0 0.3rem 0.9rem rgba(47, 87, 93, 0.04);
}

.item:hover {
  background: var(--app-surface-soft);
  border-color: var(--app-border-strong);
  border-left-color: var(--notif-color);
  box-shadow: 0 0.45rem 1rem rgba(47, 87, 93, 0.055);
  transform: translateY(-0.04rem);
}

.item:not(.unread) {
  opacity: 0.78;
}

.content {
  min-width: 0;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  min-width: 0;
}

.type-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--notif-color);
  flex: 0 0 auto;
}

h3 {
  margin: 0;
  color: var(--app-heading);
  font-size: var(--app-text-md);
  font-weight: 760;
  line-height: var(--app-leading-tight);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item.unread h3 {
  font-weight: 800;
}

.item:not(.unread) h3 {
  color: var(--app-text);
  font-weight: 650;
}

p {
  margin: 0.22rem 0 0;
  color: var(--app-muted);
  font-size: var(--app-text-sm);
  line-height: 1.4;
}

small {
  display: block;
  margin-top: 0.32rem;
  color: var(--app-subtle);
  font-size: var(--app-text-xs);
  font-weight: 650;
}

.actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.45rem;
}

.action-btn {
  min-height: 2rem;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-sm);
  padding: 0 0.75rem;
  background: var(--app-surface);
  font-family: var(--app-font-body);
  font-size: var(--app-text-xs);
  font-weight: 780;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.action-btn:hover {
  transform: translateY(-0.02rem);
}

.action-btn.read {
  color: var(--app-primary);
}

.action-btn.read:hover {
  border-color: var(--app-primary);
  background: color-mix(in srgb, var(--app-primary) 10%, white);
}

.action-btn.delete {
  color: var(--app-error);
}

.action-btn.delete:hover {
  border-color: var(--app-error);
  background: var(--app-error-bg);
}

@media (max-width: 50rem) {
  .item {
    grid-template-columns: 1fr;
    align-items: flex-start;
  }

  .actions {
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}
</style>
