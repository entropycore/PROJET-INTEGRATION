<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  action: {
    type: Object,
    required: true,
  },
  isSubmitting: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "submit"]);

const comment = ref("");
const localError = ref("");

const needsComment = computed(() => props.action?.requiresComment !== false);

watch(
  () => props.action,
  () => {
    comment.value = "";
    localError.value = "";
  },
);

const handleSubmit = () => {
  const value = comment.value.trim();

  if (needsComment.value && !value) {
    localError.value = "Veuillez saisir un commentaire.";
    return;
  }

  emit("submit", value);
};
</script>

<template>
  <div class="action-overlay">
    <section class="action-modal">
      <header class="action-header">
        <div>
          <span>{{ action.eyebrow }}</span>
          <h2>{{ action.title }}</h2>
        </div>

        <button type="button" class="icon-btn" @click="emit('close')">
          <span class="material-icons-round">close</span>
        </button>
      </header>

      <p class="action-description">
        {{ action.description }}
      </p>

      <div v-if="needsComment" class="form-group">
        <label for="validation-comment">{{ action.label }}</label>
        <textarea
          id="validation-comment"
          v-model="comment"
          rows="5"
          :placeholder="action.placeholder"
          @input="localError = ''"
        />
      </div>

      <p v-if="localError" class="error-text">{{ localError }}</p>

      <footer class="action-footer">
        <button
          type="button"
          class="secondary-btn"
          :disabled="isSubmitting"
          @click="emit('close')"
        >
          Annuler
        </button>
        <button
          type="button"
          :class="['primary-btn', action.tone]"
          :disabled="isSubmitting"
          @click="handleSubmit"
        >
          {{ isSubmitting ? "Envoi..." : action.confirmLabel }}
        </button>
      </footer>
    </section>
  </div>
</template>

<style scoped>
.action-overlay {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.42);
}

.action-modal {
  width: min(34rem, 100%);
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-panel);
  box-shadow: var(--app-shadow-popover);
  padding: 1.25rem;
}

.action-header,
.action-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.action-header span {
  color: var(--app-muted);
  font-size: var(--app-text-xs);
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.action-header h2 {
  margin: 0.25rem 0 0;
  color: var(--app-heading);
  font-family: var(--app-font-display);
  font-size: 1.45rem;
  font-weight: 600;
}

.icon-btn {
  width: 2.35rem;
  height: 2.35rem;
  display: grid;
  place-items: center;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-md);
  background: var(--app-surface);
  color: var(--app-muted);
  cursor: pointer;
}

.action-description {
  margin: 1rem 0;
  color: var(--app-muted);
  line-height: 1.55;
}

.form-group {
  display: grid;
  gap: 0.45rem;
}

.form-group label {
  color: var(--app-heading);
  font-size: var(--app-text-sm);
  font-weight: 800;
}

textarea {
  width: 100%;
  resize: vertical;
  border: 1px solid var(--app-border-strong);
  border-radius: var(--app-radius-md);
  background: var(--app-surface);
  color: var(--app-text);
  font: inherit;
  line-height: 1.5;
  padding: 0.8rem;
  outline: none;
}

textarea:focus {
  border-color: var(--app-primary);
  box-shadow: 0 0 0 3px var(--app-active-bg);
}

.error-text {
  margin: 0.75rem 0 0;
  color: var(--app-error);
  font-size: var(--app-text-sm);
}

.action-footer {
  justify-content: flex-end;
  margin-top: 1.1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--app-border);
}

.primary-btn,
.secondary-btn {
  min-height: 2.55rem;
  border-radius: var(--app-radius-md);
  padding: 0 1rem;
  font-weight: 800;
  cursor: pointer;
}

.secondary-btn {
  border: 1px solid var(--app-border-strong);
  background: var(--app-surface);
  color: var(--app-primary);
}

.primary-btn {
  border: 1px solid var(--app-primary);
  background: var(--app-primary);
  color: #ffffff;
}

.primary-btn.danger {
  border-color: transparent;
  background: var(--app-error-bg);
  color: var(--app-error);
}

.primary-btn.warning {
  border-color: var(--app-warning, #d4a72c);
  background: var(--app-warning, #d4a72c);
  color: #1f2933;
}

button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
</style>
