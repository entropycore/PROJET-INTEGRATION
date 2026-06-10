<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  letter: {
    type: Object,
    required: true,
  },
  mode: {
    type: String,
    default: "write",
  },
  isSubmitting: Boolean,
});

const emit = defineEmits(["close", "save-draft", "send", "reject"]);
const content = ref("");

const isRejectMode = computed(() => props.mode === "reject");
const title = computed(() =>
  isRejectMode.value ? "Refuser la demande" : "Rédiger la lettre",
);

watch(
  () => [props.letter, props.mode],
  () => {
    content.value = isRejectMode.value
      ? ""
      : props.letter?.letterContent || "";
  },
  { immediate: true },
);
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <section class="letter-modal" :class="{ danger: isRejectMode }">
      <header>
        <span class="modal-icon material-icons-round">
          {{ isRejectMode ? "cancel" : "edit_note" }}
        </span>
        <div>
          <h2>{{ title }}</h2>
          <p>{{ letter.student.fullName }} · {{ letter.title }}</p>
        </div>
        <button type="button" class="close-btn" @click="emit('close')">
          <span class="material-icons-round">close</span>
        </button>
      </header>

      <section class="request-context">
        <span>Message de l’étudiant</span>
        <p>{{ letter.requestMessage }}</p>
      </section>

      <label>
        <span class="label-row">
          <strong>
            {{ isRejectMode ? "Motif du refus" : "Contenu de la lettre" }}
          </strong>
          <small>{{ content.length }}/3000</small>
        </span>
        <textarea
          v-model="content"
          rows="10"
          maxlength="3000"
          :placeholder="
            isRejectMode
              ? 'Expliquez clairement la raison du refus...'
              : 'Rédigez la lettre de recommandation...'
          "
        ></textarea>
      </label>

      <footer>
        <button type="button" class="secondary" @click="emit('close')">
          Annuler
        </button>
        <template v-if="isRejectMode">
          <button
            type="button"
            class="reject"
            :disabled="!content.trim() || isSubmitting"
            @click="emit('reject', content.trim())"
          >
            <span class="material-icons-round">cancel</span>
            Confirmer le refus
          </button>
        </template>
        <template v-else>
          <button
            type="button"
            class="secondary"
            :disabled="!content.trim() || isSubmitting"
            @click="emit('save-draft', content.trim())"
          >
            <span class="material-icons-round">save</span>
            Enregistrer le brouillon
          </button>
          <button
            type="button"
            class="primary"
            :disabled="!content.trim() || isSubmitting"
            @click="emit('send', content.trim())"
          >
            <span class="material-icons-round">send</span>
            Envoyer la lettre
          </button>
        </template>
      </footer>
    </section>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(0.12rem);
}

.letter-modal {
  width: min(100%, 44rem);
  max-height: calc(100vh - 2rem);
  overflow: auto;
  padding: 1.35rem;
  border: 1px solid var(--app-border);
  border-top: 0.28rem solid var(--app-primary);
  border-radius: var(--app-radius-panel);
  background:
    linear-gradient(180deg, var(--app-active-bg) 0, var(--app-surface) 5rem),
    var(--app-surface);
  box-shadow: var(--app-shadow-popover);
}

.letter-modal.danger {
  border-top-color: var(--app-error);
}

header,
footer,
.label-row {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

header {
  align-items: flex-start;
}

.modal-icon {
  width: 2.8rem;
  height: 2.8rem;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 50%;
  background: var(--app-active-bg);
  color: var(--app-primary);
}

header div {
  min-width: 0;
  flex: 1;
}

h2 {
  margin: 0;
  color: var(--app-heading);
  font-family: var(--app-font-display);
  font-size: 1.65rem;
}

header p {
  margin: 0.25rem 0 0;
  color: var(--app-muted);
}

.close-btn {
  width: 2.45rem;
  height: 2.45rem;
  display: grid;
  place-items: center;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-md);
  background: var(--app-surface);
  color: var(--app-muted);
  cursor: pointer;
}

.request-context {
  margin: 1rem 0;
  padding: 0.9rem 1rem;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-md);
  background: var(--app-surface-soft);
}

.request-context span {
  color: var(--app-primary);
  font-size: var(--app-text-xs);
  font-weight: 800;
  text-transform: uppercase;
}

.request-context p {
  margin: 0.35rem 0 0;
  color: var(--app-muted);
  line-height: 1.55;
}

label {
  display: grid;
  gap: 0.45rem;
}

.label-row {
  justify-content: space-between;
}

.label-row strong {
  color: var(--app-heading);
  font-size: var(--app-text-sm);
}

.label-row small {
  color: var(--app-muted);
}

textarea {
  width: 100%;
  min-height: 13rem;
  resize: vertical;
  border: 1px solid var(--app-border-strong);
  border-radius: var(--app-radius-md);
  padding: 0.8rem;
  background: var(--app-surface);
  color: var(--app-text);
  font: inherit;
  line-height: 1.6;
  outline: none;
}

textarea:focus {
  border-color: var(--app-primary);
  box-shadow: 0 0 0 3px var(--app-active-bg);
}

footer {
  justify-content: flex-end;
  flex-wrap: wrap;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--app-border);
}

footer button {
  min-height: 2.55rem;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border-radius: var(--app-radius-md);
  padding: 0 1rem;
  font-weight: 800;
  cursor: pointer;
}

.secondary {
  border: 1px solid var(--app-border-strong);
  background: var(--app-surface);
  color: var(--app-primary);
}

.primary {
  border: 1px solid var(--app-primary);
  background: var(--app-primary);
  color: #ffffff;
}

.reject {
  border: 1px solid var(--app-error);
  background: var(--app-error);
  color: #ffffff;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
</style>
