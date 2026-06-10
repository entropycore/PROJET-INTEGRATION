<script setup>
import { computed, onMounted, ref } from "vue";

import ProfessorRecommendationLetterModal from "@/components/professor/ProfessorRecommendationLetterModal.vue";
import RecommendationLetterPreviewModal from "@/components/student/recommendationLetters/RecommendationLetterPreviewModal.vue";
import RecommendationLetterStatusBadge from "@/components/student/recommendationLetters/RecommendationLetterStatusBadge.vue";
import {
  getProfessorRecommendationLetters,
  rejectProfessorRecommendationLetter,
  saveProfessorRecommendationLetterDraft,
  sendProfessorRecommendationLetter,
} from "@/services/professorRecommendationLettersService";

const letters = ref([]);
const search = ref("");
const selectedStatus = ref("ALL");
const selectedLetter = ref(null);
const modalMode = ref("write");
const isSubmitting = ref(false);
const feedback = ref("");
const previewLetter = ref(null);

const loadLetters = async () => {
  letters.value = await getProfessorRecommendationLetters();
};

onMounted(loadLetters);

const filteredLetters = computed(() => {
  const query = search.value.trim().toLowerCase();
  return letters.value.filter((letter) => {
    const matchesSearch =
      !query ||
      letter.student.fullName.toLowerCase().includes(query) ||
      letter.title.toLowerCase().includes(query);
    const matchesStatus =
      selectedStatus.value === "ALL" ||
      letter.validationStatus === selectedStatus.value;
    return matchesSearch && matchesStatus;
  });
});

const openModal = (letter, mode) => {
  selectedLetter.value = letter;
  modalMode.value = mode;
};

const closeModal = () => {
  selectedLetter.value = null;
};

const runAction = async (action, message) => {
  isSubmitting.value = true;
  await action(selectedLetter.value.id, message);
  isSubmitting.value = false;
  feedback.value =
    modalMode.value === "reject"
      ? "La demande a été refusée."
      : "La lettre a été mise à jour.";
  closeModal();
  await loadLetters();
};
</script>

<template>
  <section class="professor-letters-page">
    <header class="page-header">
      <div>
        <span>ESPACE PROFESSEUR</span>
        <h1>Lettres de recommandation</h1>
        <p>Rédigez et suivez les demandes reçues des étudiants.</p>
      </div>
    </header>

    <section class="letters-panel">
      <div class="toolbar">
        <label>
          <span class="material-icons-round">search</span>
          <input v-model="search" placeholder="Rechercher un étudiant ou un objet..." />
        </label>
        <select v-model="selectedStatus">
          <option value="ALL">Tous les statuts</option>
          <option value="PENDING">À rédiger</option>
          <option value="DRAFT">Brouillons</option>
          <option value="APPROVED">Envoyées</option>
          <option value="CHANGES_REQUESTED">Correction demandée</option>
          <option value="REJECTED">Refusées</option>
        </select>
      </div>

      <p v-if="feedback" class="feedback">{{ feedback }}</p>

      <div v-if="filteredLetters.length" class="letters-list">
        <article v-for="letter in filteredLetters" :key="letter.id" class="letter-row">
          <section class="letter-main">
            <div class="student-avatar">
              {{ letter.student.fullName.split(" ").map((part) => part[0]).join("").slice(0, 2) }}
            </div>
            <div class="letter-copy">
              <div class="student-info">
                <strong>{{ letter.student.fullName }}</strong>
                <span>{{ letter.student.major }} · {{ letter.student.level }}</span>
              </div>
              <h2>{{ letter.title }}</h2>
              <p>{{ letter.requestMessage }}</p>
            </div>
          </section>

          <aside class="letter-context">
            <RecommendationLetterStatusBadge :status="letter.validationStatus" />
            <div class="actions">
              <button
                v-if="['PENDING', 'DRAFT', 'CHANGES_REQUESTED'].includes(letter.validationStatus)"
                class="primary"
                @click="openModal(letter, 'write')"
              >
                <span class="material-icons-round">edit_note</span>
                {{ letter.validationStatus === "PENDING" ? "Rédiger" : "Modifier" }}
              </button>
              <button
                v-if="letter.validationStatus === 'PENDING'"
                class="danger"
                @click="openModal(letter, 'reject')"
              >
                Refuser
              </button>
              <button
                v-if="letter.validationStatus === 'APPROVED'"
                class="secondary"
                @click="previewLetter = letter"
              >
                <span class="material-icons-round">menu_book</span>
                Voir la lettre
              </button>
            </div>
          </aside>
        </article>
      </div>

      <p v-else class="empty-text">Aucune demande ne correspond aux filtres.</p>
    </section>

    <ProfessorRecommendationLetterModal
      v-if="selectedLetter"
      :letter="selectedLetter"
      :mode="modalMode"
      :is-submitting="isSubmitting"
      @close="closeModal"
      @save-draft="runAction(saveProfessorRecommendationLetterDraft, $event)"
      @send="runAction(sendProfessorRecommendationLetter, $event)"
      @reject="runAction(rejectProfessorRecommendationLetter, $event)"
    />

    <RecommendationLetterPreviewModal
      :letter="previewLetter"
      @close="previewLetter = null"
    />
  </section>
</template>

<style scoped>
.professor-letters-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  color: var(--app-text);
}

.page-header span {
  color: var(--app-subtle);
  font-size: var(--app-text-xs);
  font-weight: 800;
  letter-spacing: 0.06em;
}

.page-header h1 {
  margin: 0.35rem 0 0;
  color: var(--app-heading);
  font-family: var(--app-font-display);
  font-size: clamp(1.8rem, 2.4vw, 2.3rem);
  font-weight: 500;
}

.page-header p {
  margin: 0.4rem 0 0;
  color: var(--app-muted);
}

.letters-panel {
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-panel);
  background: var(--app-surface);
  box-shadow: var(--app-shadow-card);
}

.letters-panel {
  padding: 1rem;
}

.toolbar {
  display: grid;
  grid-template-columns: 1fr 15rem;
  gap: 1rem;
}

.toolbar label {
  position: relative;
}

.toolbar label span {
  position: absolute;
  top: 50%;
  left: 0.8rem;
  transform: translateY(-50%);
  color: var(--app-muted);
}

input,
select {
  width: 100%;
  min-height: 2.9rem;
  border: 1px solid var(--app-border-strong);
  border-radius: var(--app-radius-md);
  background: var(--app-surface);
  color: var(--app-text);
  font: inherit;
  outline: none;
}

input {
  padding: 0 0.8rem 0 2.7rem;
}

select {
  padding: 0 0.8rem;
}

.letters-list {
  display: grid;
  gap: 0.8rem;
  margin-top: 1rem;
}

.letter-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 11rem;
  align-items: stretch;
  padding: 1rem;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-md);
  background: var(--app-surface);
}

.letter-main {
  min-width: 0;
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
}

.student-avatar {
  width: 2.9rem;
  height: 2.9rem;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--app-primary);
  color: #ffffff;
  font-weight: 800;
}

.letter-copy {
  min-width: 0;
}

.student-info {
  display: grid;
  gap: 0.15rem;
}

.student-info strong,
.letter-copy h2 {
  color: var(--app-heading);
}

.student-info span,
.letter-copy p {
  color: var(--app-muted);
  font-size: var(--app-text-sm);
}

.letter-copy h2 {
  margin: 0.55rem 0 0.25rem;
  font-size: 1rem;
}

.letter-copy p {
  margin: 0;
  line-height: 1.5;
}

.letter-context {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  padding-left: 1rem;
  border-left: 1px solid var(--app-border);
}

.actions {
  width: 100%;
  display: grid;
  gap: 0.5rem;
}

.actions button {
  min-height: 2.45rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border-radius: var(--app-radius-md);
  padding: 0 0.8rem;
  font-weight: 800;
  cursor: pointer;
  justify-content: center;
}

.primary {
  border: 1px solid var(--app-primary);
  background: var(--app-primary);
  color: #ffffff;
}

.danger {
  border: 1px solid var(--app-error-bg);
  background: var(--app-surface);
  color: var(--app-error);
}

.secondary {
  border: 1px solid var(--app-border-strong);
  background: var(--app-surface);
  color: var(--app-primary);
}

.feedback {
  color: var(--app-success);
  font-weight: 800;
}

.feedback {
  margin: 1rem 0 0;
}

.empty-text {
  margin: 1rem 0 0;
  padding: 1rem;
  color: var(--app-muted);
  text-align: center;
}

@media (max-width: 900px) {
  .toolbar {
    grid-template-columns: 1fr;
  }

  .letter-row {
    grid-template-columns: 1fr;
  }

  .letter-context {
    align-items: flex-start;
    padding: 1rem 0 0;
    border-top: 1px solid var(--app-border);
    border-left: 0;
  }
}
</style>
