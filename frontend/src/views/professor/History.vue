<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink } from "vue-router";

import ProfessorValidationDetailsModal from "@/components/professor/ProfessorValidationDetailsModal.vue";
import {
  getProfessorValidationDetails,
  getProfessorValidationHistory,
} from "@/services/professorApi";

const isLoading = ref(false);
const errorMessage = ref("");
const items = ref([]);
const search = ref("");
const selectedType = ref("ALL");
const selectedStatus = ref("ALL");
const selectedValidation = ref(null);
const isDetailsOpen = ref(false);

const statusLabels = {
  APPROVED: "Approuve",
  REJECTED: "Refuse",
  CHANGES_REQUESTED: "Correction demandee",
};

const typeLabels = {
  PROJECT: "Projet",
  INTERNSHIP: "Stage",
};

const loadHistory = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const data = await getProfessorValidationHistory({
      type: selectedType.value,
      status: selectedStatus.value,
      search: search.value,
    });

    items.value = data.items || [];
  } catch (error) {
    console.error("Erreur historique professeur :", error);
    items.value = [];
    errorMessage.value = "Impossible de charger l'historique.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadHistory);
watch([selectedType, selectedStatus], loadHistory);

const filteredItems = computed(() => {
  const keyword = search.value.trim().toLowerCase();
  if (!keyword) return items.value;

  return items.value.filter((item) =>
    [
      item.title,
      item.description,
      item.student?.fullName,
      item.student?.email,
      item.comment,
      item.actionLabel,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(keyword)),
  );
});

const summary = computed(() =>
  items.value.reduce(
    (total, item) => {
      total.actions += 1;
      if (item.decision === "APPROVED") total.approved += 1;
      if (item.decision === "REJECTED") total.rejected += 1;
      if (item.decision === "CHANGES_REQUESTED") total.changes += 1;
      return total;
    },
    { actions: 0, approved: 0, rejected: 0, changes: 0 },
  ),
);

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusClass = (status) => String(status || "").toLowerCase();

const openDetails = async (item) => {
  try {
    selectedValidation.value = await getProfessorValidationDetails(item);
  } catch {
    selectedValidation.value = item;
  }

  isDetailsOpen.value = true;
};

const closeDetails = () => {
  selectedValidation.value = null;
  isDetailsOpen.value = false;
};
</script>

<template>
  <section class="professor-history-page">
    <header class="page-header">
      <div>
        <span>ESPACE PROFESSEUR</span>
        <h1>Historique des actions</h1>
        <p>Consultez les validations deja traitees.</p>
      </div>

      <RouterLink to="/professor/validations" class="primary-link">
        <span class="material-icons-round">fact_check</span>
        Validations
      </RouterLink>
    </header>

    <div class="summary-grid">
      <article class="summary-card">
        <span class="material-icons-round">history</span>
        <div>
          <strong>{{ summary.actions }}</strong>
          <p>Actions</p>
        </div>
      </article>

      <article class="summary-card">
        <span class="material-icons-round">check_circle</span>
        <div>
          <strong>{{ summary.approved }}</strong>
          <p>Approuvees</p>
        </div>
      </article>

      <article class="summary-card">
        <span class="material-icons-round">cancel</span>
        <div>
          <strong>{{ summary.rejected }}</strong>
          <p>Refusees</p>
        </div>
      </article>

      <article class="summary-card">
        <span class="material-icons-round">rate_review</span>
        <div>
          <strong>{{ summary.changes }}</strong>
          <p>Corrections</p>
        </div>
      </article>
    </div>

    <section class="history-card">
      <div class="toolbar">
        <div class="search-box">
          <span class="material-icons-round">search</span>
          <input v-model="search" type="text" placeholder="Rechercher..." />
        </div>

        <select v-model="selectedType">
          <option value="ALL">Tous les types</option>
          <option value="PROJECT">Projets</option>
          <option value="INTERNSHIP">Stages</option>
        </select>

        <select v-model="selectedStatus">
          <option value="ALL">Tous les statuts</option>
          <option value="APPROVED">Approuve</option>
          <option value="REJECTED">Refuse</option>
          <option value="CHANGES_REQUESTED">Correction demandee</option>
        </select>

        <button type="button" class="refresh-btn" @click="loadHistory">
          <span class="material-icons-round">refresh</span>
        </button>
      </div>

      <div v-if="isLoading" class="state-box">
        Chargement de l'historique...
      </div>

      <div v-else-if="errorMessage" class="state-box error">
        {{ errorMessage }}
      </div>

      <div v-else class="history-table">
        <div class="table-head">
          <span>Action</span>
          <span>Etudiant</span>
          <span>Type</span>
          <span>Statut</span>
          <span>Date</span>
          <span></span>
        </div>

        <article
          v-for="item in filteredItems"
          :key="`${item.itemType}-${item.id}`"
          class="table-row"
        >
          <div>
            <strong>{{ item.title }}</strong>
            <p>{{ item.comment || item.actionLabel }}</p>
          </div>

          <div>
            <strong>{{ item.student?.fullName }}</strong>
            <p>{{ item.student?.email || "Email non renseigne" }}</p>
          </div>

          <span>{{ typeLabels[item.itemType] || item.itemType }}</span>

          <span class="status-pill" :class="statusClass(item.decision)">
            {{ statusLabels[item.decision] || item.decision }}
          </span>

          <span>{{ formatDate(item.decisionDate) }}</span>

          <button
            type="button"
            class="icon-btn"
            title="Voir"
            aria-label="Voir le detail"
            @click="openDetails(item)"
          >
            <span class="material-icons-round">visibility</span>
          </button>
        </article>

        <p v-if="!filteredItems.length" class="empty-text">
          Aucune action trouvee.
        </p>
      </div>
    </section>

    <ProfessorValidationDetailsModal
      v-if="isDetailsOpen && selectedValidation"
      :validation="selectedValidation"
      @close="closeDetails"
    />
  </section>
</template>

<style scoped>
.professor-history-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  color: var(--app-text);
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
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
  margin: 0.45rem 0 0;
  color: var(--app-muted);
}

.primary-link {
  min-height: 2.7rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1rem;
  border-radius: var(--app-radius-md);
  background: var(--app-primary);
  color: #ffffff;
  font-weight: 800;
  text-decoration: none;
}

.primary-link .material-icons-round {
  color: #ffffff;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.summary-card,
.history-card {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-panel);
  box-shadow: var(--app-shadow-card);
}

.summary-card {
  min-height: 6.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

.summary-card .material-icons-round {
  width: 2.5rem;
  height: 2.5rem;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--app-active-bg);
  color: var(--app-primary);
}

.summary-card strong {
  display: block;
  color: var(--app-heading);
  font-size: 2rem;
  line-height: 1;
}

.summary-card p {
  margin: 0.35rem 0 0;
  color: var(--app-muted);
  font-size: var(--app-text-sm);
  font-weight: 700;
}

.history-card {
  overflow: hidden;
}

.toolbar {
  display: grid;
  grid-template-columns: 1fr 13rem 13rem 2.6rem;
  gap: 0.8rem;
  padding: 1rem;
  border-bottom: 1px solid var(--app-border);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  height: 2.55rem;
  padding: 0 0.85rem;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-md);
}

input,
select {
  width: 100%;
  height: 2.55rem;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-md);
  background: var(--app-surface);
  color: var(--app-text);
  font-size: var(--app-text-sm);
  outline: none;
}

input {
  height: auto;
  border: none;
  background: transparent;
}

select {
  padding: 0 0.75rem;
}

.refresh-btn,
.icon-btn {
  display: grid;
  place-items: center;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-md);
  background: var(--app-surface);
  color: var(--app-primary);
  cursor: pointer;
}

.refresh-btn {
  width: 2.55rem;
  height: 2.55rem;
}

.history-table {
  display: flex;
  flex-direction: column;
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns:
    minmax(0, 31%)
    minmax(0, 24%)
    minmax(5rem, 9%)
    minmax(8rem, 14%)
    minmax(6rem, 10%)
    minmax(2.4rem, 4%);
  gap: 0.75rem;
  align-items: center;
  padding: 0.9rem 1rem;
}

.table-head {
  color: var(--app-muted);
  font-size: var(--app-text-xs);
  font-weight: 800;
  text-transform: uppercase;
  background: var(--app-surface-soft);
  border-bottom: 1px solid var(--app-border);
}

.table-row {
  border-bottom: 1px solid var(--app-border);
}

.table-row strong {
  color: var(--app-heading);
  font-size: var(--app-text-sm);
}

.table-row p,
.table-row span {
  margin: 0.2rem 0 0;
  color: var(--app-muted);
  font-size: var(--app-text-xs);
}

.status-pill {
  width: fit-content;
  min-height: 1.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.65rem;
  border-radius: var(--app-radius-pill);
  background: var(--app-warning-bg);
  color: var(--app-warning);
  font-weight: 800;
  white-space: nowrap;
}

.status-pill.approved {
  background: var(--app-active-bg);
  color: var(--app-active);
}

.status-pill.rejected {
  background: var(--app-error-bg);
  color: var(--app-error);
}

.icon-btn {
  width: 2rem;
  height: 2rem;
  justify-self: end;
}

.state-box,
.empty-text {
  padding: 2rem;
  color: var(--app-muted);
  text-align: center;
}

.state-box.error {
  color: var(--app-error);
}

@media (max-width: 1000px) {
  .summary-grid,
  .toolbar {
    grid-template-columns: 1fr 1fr;
  }

  .table-head {
    display: none;
  }

  .table-row {
    grid-template-columns: 1fr;
  }

  .icon-btn {
    justify-self: start;
  }
}

@media (max-width: 720px) {
  .page-header {
    flex-direction: column;
  }

  .summary-grid,
  .toolbar {
    grid-template-columns: 1fr;
  }
}
</style>
