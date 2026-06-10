<script setup>
import { computed, reactive, watch } from "vue";

const props = defineProps({
  open: Boolean,
  teachers: {
    type: Array,
    default: () => [],
  },
  isSubmitting: Boolean,
});

const emit = defineEmits(["close", "submit"]);

const form = reactive({
  teacherId: "",
  type: "",
  title: "",
  content: "",
});

const isValid = computed(
  () =>
    form.teacherId &&
    form.type &&
    form.title.trim() &&
    form.content.trim(),
);

watch(
  () => props.open,
  (open) => {
    if (!open) return;
    form.teacherId = "";
    form.type = "";
    form.title = "";
    form.content = "";
  },
);

const submit = () => {
  if (!isValid.value || props.isSubmitting) return;
  emit("submit", {
    teacherId: form.teacherId,
    type: form.type,
    title: form.title.trim(),
    content: form.content.trim(),
  });
};
</script>

<template>
  <div v-if="open" class="modal-overlay" @click.self="emit('close')">
    <section class="request-modal" role="dialog" aria-modal="true">
      <header>
        <span class="modal-icon material-icons-round">history_edu</span>
        <div>
          <h2>Faire une demande</h2>
          <p>Préparez votre demande de lettre de recommandation.</p>
        </div>
        <button type="button" class="close-btn" @click="emit('close')">
          <span class="material-icons-round">close</span>
        </button>
      </header>

      <div class="form-grid">
        <label>
          <span>Enseignant</span>
          <select v-model="form.teacherId">
            <option value="">Sélectionner un enseignant</option>
            <option
              v-for="teacher in teachers"
              :key="teacher.id"
              :value="teacher.id"
            >
              {{ teacher.fullName }} · {{ teacher.department }}
            </option>
          </select>
        </label>

        <label>
          <span>Type</span>
          <select v-model="form.type">
            <option value="">Sélectionner un type</option>
            <option value="DOUBLE_DEGREE">Double diplôme</option>
            <option value="MASTER">Master</option>
            <option value="DOCTORATE">Doctorat</option>
            <option value="INTERNSHIP">Stage</option>
            <option value="EMPLOYMENT">Emploi</option>
            <option value="INTERNATIONAL_PROGRAM">
              Programme international
            </option>
          </select>
        </label>

        <label class="full-width">
          <span>Objet</span>
          <input
            v-model="form.title"
            maxlength="200"
            placeholder="Ex : Candidature Master Data Science"
          />
        </label>

        <label class="full-width">
          <span class="label-row">
            <strong>Message</strong>
            <small>{{ form.content.length }}/1200</small>
          </span>
          <textarea
            v-model="form.content"
            rows="6"
            maxlength="1200"
            placeholder="Présentez votre demande et le contexte de candidature..."
          ></textarea>
        </label>
      </div>

      <footer>
        <button type="button" class="secondary" @click="emit('close')">
          <span class="material-icons-round">close</span>
          Annuler
        </button>
        <button
          type="button"
          class="primary"
          :disabled="!isValid || isSubmitting"
          @click="submit"
        >
          <span class="material-icons-round">
            {{ isSubmitting ? "hourglass_top" : "send" }}
          </span>
          {{ isSubmitting ? "Envoi..." : "Envoyer la demande" }}
        </button>
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

.request-modal {
  width: min(100%, 42rem);
  padding: 1.35rem;
  border: 1px solid #dee1dd;
  border-top: 0.28rem solid #2f575d;
  border-radius: 1rem;
  background:
    linear-gradient(180deg, #edf2f0 0, #ffffff 5rem),
    #ffffff;
  box-shadow: 0 1.2rem 3rem rgba(16, 42, 51, 0.18);
}

header {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
}

.modal-icon {
  width: 2.8rem;
  height: 2.8rem;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #dce9e6;
  color: #2f575d;
}

header div {
  min-width: 0;
  flex: 1;
}

h2 {
  margin: 0;
  color: #28363d;
  font-family: "Times New Roman", serif;
  font-size: 1.65rem;
}

header p {
  margin: 0.3rem 0 0;
  color: #6d9197;
}

.close-btn {
  width: 2.45rem;
  height: 2.45rem;
  display: grid;
  place-items: center;
  border: 1px solid #dee1dd;
  border-radius: 0.625rem;
  background: #ffffff;
  color: #6d9197;
  cursor: pointer;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1.25rem;
}

label {
  display: grid;
  gap: 0.4rem;
}

label > span,
.label-row strong {
  color: #28363d;
  font-size: 0.85rem;
  font-weight: 800;
}

.full-width {
  grid-column: 1 / -1;
}

.label-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.label-row small {
  color: #6d9197;
  font-weight: 500;
}

input,
select,
textarea {
  width: 100%;
  border: 1px solid #c4cdc1;
  border-radius: 0.625rem;
  background: #ffffff;
  color: #28363d;
  font: inherit;
  outline: none;
}

input,
select {
  height: 3rem;
  padding: 0 0.8rem;
}

textarea {
  min-height: 9rem;
  resize: vertical;
  padding: 0.8rem;
  line-height: 1.5;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #2f575d;
  box-shadow: 0 0 0 3px #edf2f0;
}

footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 1.2rem;
  padding-top: 1rem;
  border-top: 1px solid #edf0ee;
}

footer button {
  min-height: 2.55rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  border-radius: 0.625rem;
  padding: 0 1rem;
  font-weight: 800;
  cursor: pointer;
}

.secondary {
  border: 1px solid #c4cdc1;
  background: #ffffff;
  color: #2f575d;
}

.primary {
  border: 1px solid #2f575d;
  background: #2f575d;
  color: #ffffff;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

@media (max-width: 700px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  footer {
    flex-direction: column-reverse;
  }
}
</style>
