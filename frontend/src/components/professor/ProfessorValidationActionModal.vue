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
const commentLength = computed(() => comment.value.trim().length);

const actionIcon = computed(() => {
  const icons = {
    approve: "check_circle",
    reject: "cancel",
    requestChanges: "rate_review",
  };

  return icons[props.action?.type] || "fact_check";
});

const validationTypeLabel = computed(() => {
  if (props.action?.validation?.targetType === "PROJECT") return "Projet";
  if (props.action?.validation?.targetType === "INTERNSHIP") return "Stage";
  return "Validation";
});

const studentName = computed(
  () => props.action?.validation?.student?.fullName || "Étudiant non renseigné",
);

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
  <div class="action-overlay" @click.self="emit('close')">
    <section
      :class="['action-modal', action.tone]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="professor-validation-action-title"
    >
      <header class="action-header">
        <span :class="['action-icon', action.tone]" aria-hidden="true">
          <span class="material-icons-round">{{ actionIcon }}</span>
        </span>

        <div class="action-title-block">
          <span class="action-eyebrow">{{ action.eyebrow }}</span>
          <h2 id="professor-validation-action-title">{{ action.title }}</h2>
        </div>

        <button
          type="button"
          class="icon-btn"
          aria-label="Fermer la fenêtre"
          @click="emit('close')"
        >
          <span class="material-icons-round">close</span>
        </button>
      </header>

      <div class="validation-context">
        <span>{{ validationTypeLabel }}</span>
        <strong>{{ action.validation?.title }}</strong>
        <p>{{ studentName }}</p>
      </div>

      <p class="action-description">
        {{ action.description }}
      </p>

      <div v-if="needsComment" class="form-group">
        <div class="label-row">
          <label for="validation-comment">{{ action.label }}</label>
          <small>{{ commentLength }}/600</small>
        </div>
        <textarea
          id="validation-comment"
          v-model="comment"
          rows="5"
          maxlength="600"
          :placeholder="action.placeholder"
          autofocus
          @input="localError = ''"
        />
        <small class="hint-text">
          Soyez précis : indiquez ce qui manque et ce que l'étudiant doit
          déposer ou modifier.
        </small>
      </div>

      <p v-if="localError" class="error-text">{{ localError }}</p>

      <footer class="action-footer">
        <button
          type="button"
          class="secondary-btn"
          :disabled="isSubmitting"
          @click="emit('close')"
        >
          <span class="material-icons-round">close</span>
          Annuler
        </button>
        <button
          type="button"
          :class="['primary-btn', action.tone]"
          :disabled="isSubmitting"
          @click="handleSubmit"
        >
          <span class="material-icons-round">
            {{ isSubmitting ? "hourglass_top" : "send" }}
          </span>
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
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(0.12rem);
}

.action-modal {
  width: min(39rem, 100%);
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-panel);
  box-shadow: var(--app-shadow-popover);
  padding: 1.35rem;
}

.action-modal.warning {
  border-top: 0.28rem solid var(--app-warning);
}

.action-modal.danger {
  border-top: 0.28rem solid var(--app-error);
}

.action-modal.success {
  border-top: 0.28rem solid var(--app-success);
}

.action-header,
.action-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.action-header {
  align-items: flex-start;
}

.action-title-block {
  min-width: 0;
  flex: 1;
}

.action-eyebrow {
  display: block;
  color: var(--app-muted);
  font-size: var(--app-text-xs);
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.action-icon {
  width: 2.8rem;
  height: 2.8rem;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 50%;
  background: var(--app-active-bg);
  color: var(--app-primary);
}

.action-icon.warning {
  background: var(--app-warning-bg);
  color: var(--app-warning);
}

.action-icon.danger {
  background: var(--app-error-bg);
  color: var(--app-error);
}

.action-icon.success {
  background: var(--app-success-bg);
  color: var(--app-success);
}

.action-icon .material-icons-round {
  font-size: 1.35rem;
}

.action-header h2 {
  margin: 0.25rem 0 0;
  color: var(--app-heading);
  font-family: var(--app-font-display);
  font-size: clamp(1.45rem, 2vw, 1.75rem);
  font-weight: 600;
  line-height: 1.15;
}

.icon-btn {
  width: 2.45rem;
  height: 2.45rem;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-md);
  background: var(--app-surface);
  color: var(--app-muted);
  cursor: pointer;
}

.icon-btn:hover {
  background: var(--app-surface-soft);
  color: var(--app-heading);
}

.icon-btn .material-icons-round {
  font-size: 1.2rem;
}

.validation-context {
  display: grid;
  gap: 0.2rem;
  margin: 1.05rem 0;
  padding: 0.9rem 1rem;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-md);
  background: var(--app-surface-soft);
}

.validation-context span {
  color: var(--app-muted);
  font-size: var(--app-text-xs);
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.validation-context strong {
  color: var(--app-heading);
  overflow-wrap: anywhere;
}

.validation-context p {
  margin: 0;
  color: var(--app-muted);
  font-size: var(--app-text-sm);
}

.action-description {
  margin: 0 0 1rem;
  color: var(--app-muted);
  line-height: 1.55;
}

.form-group {
  display: grid;
  gap: 0.45rem;
}

.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.label-row label {
  color: var(--app-heading);
  font-size: var(--app-text-sm);
  font-weight: 800;
}

.label-row small,
.hint-text {
  color: var(--app-muted);
  font-size: var(--app-text-xs);
}

textarea {
  width: 100%;
  min-height: 9rem;
  max-height: 16rem;
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
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

.primary-btn.success {
  border-color: var(--app-success);
  background: var(--app-success);
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

.primary-btn .material-icons-round,
.secondary-btn .material-icons-round {
  font-size: 1.05rem;
}

button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .action-modal {
    padding: 1rem;
  }

  .action-header {
    gap: 0.8rem;
  }

  .action-icon {
    width: 2.45rem;
    height: 2.45rem;
  }

  .action-footer {
    flex-direction: column-reverse;
  }

  .primary-btn,
  .secondary-btn {
    width: 100%;
  }
}
</style>
