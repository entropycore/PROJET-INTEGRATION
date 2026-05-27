<script setup>
import { computed, onMounted, ref, watch } from "vue";

import ProfessorValidationDetailsModal from "@/components/professor/ProfessorValidationDetailsModal.vue";
import ProfessorValidationStats from "@/components/professor/ProfessorValidationStats.vue";
import ProfessorValidationToolbar from "@/components/professor/ProfessorValidationToolbar.vue";
import ProfessorValidationsTable from "@/components/professor/ProfessorValidationsTable.vue";
import {
  approveProfessorValidation,
  getProfessorValidationDetails,
  getProfessorValidationStats,
  getProfessorValidations,
  rejectProfessorValidation,
  requestProfessorValidationChanges,
} from "@/services/professorApi";

const isLoading = ref(false);
const errorMessage = ref("");
const validations = ref([]);
const stats = ref({
  count: 0,
  projects: 0,
  internships: 0,
  approved: 0,
  rejected: 0,
  changesRequested: 0,
});

const search = ref("");
const selectedType = ref("ALL");
const selectedStatus = ref("PENDING");
const selectedValidation = ref(null);
const isDetailsOpen = ref(false);

const fetchValidations = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const [validationsData, statsData] = await Promise.all([
      getProfessorValidations({
        type: selectedType.value,
        status: selectedStatus.value,
        search: search.value,
      }),
      getProfessorValidationStats(),
    ]);

    validations.value = validationsData.items || [];
    stats.value = statsData;
  } catch (error) {
    console.error("Erreur validations professeur :", error);
    validations.value = [];
    errorMessage.value = "Impossible de charger les validations.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchValidations);

watch([selectedType, selectedStatus], fetchValidations);

const filteredValidations = computed(() => {
  const keyword = search.value.trim().toLowerCase();

  if (!keyword) return validations.value;

  return validations.value.filter((validation) => {
    return [
      validation.title,
      validation.description,
      validation.student?.fullName,
      validation.student?.email,
      validation.student?.field,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(keyword));
  });
});

const openDetails = async (validation) => {
  try {
    selectedValidation.value = await getProfessorValidationDetails(validation);
  } catch (error) {
    console.error("Erreur detail validation professeur :", error);
    selectedValidation.value = validation;
  }

  isDetailsOpen.value = true;
};

const closeDetails = () => {
  isDetailsOpen.value = false;
  selectedValidation.value = null;
};

const refreshAfterAction = async () => {
  closeDetails();
  await fetchValidations();
};

const askComment = (message) => {
  const comment = window.prompt(message);

  if (comment === null) return null;
  return comment.trim();
};

const handleApprove = async (validation) => {
  if (!window.confirm("Approuver cette validation ?")) return;

  try {
    await approveProfessorValidation(validation);
    await refreshAfterAction();
  } catch (error) {
    console.error("Erreur approbation professeur :", error);
    alert("Impossible d'approuver cette validation.");
  }
};

const handleReject = async (validation) => {
  const comment = askComment("Motif du refus :");
  if (comment === null) return;

  try {
    await rejectProfessorValidation(validation, { comment });
    await refreshAfterAction();
  } catch (error) {
    console.error("Erreur refus professeur :", error);
    alert("Impossible de refuser cette validation.");
  }
};

const handleRequestChanges = async (validation) => {
  const comment = askComment("Correction demandee a l'etudiant :");
  if (comment === null) return;

  try {
    await requestProfessorValidationChanges(validation, { comment });
    await refreshAfterAction();
  } catch (error) {
    console.error("Erreur correction professeur :", error);
    alert("Impossible d'envoyer la demande de correction.");
  }
};
</script>

<template>
  <section class="professor-validations-page">
    <header class="page-header">
      <div>
        <span>ESPACE PROFESSEUR</span>
        <h1>Validations</h1>
        <p>Validez les projets et stages qui vous sont assignes.</p>
      </div>
    </header>

    <ProfessorValidationStats :stats="stats" />

    <section class="validations-card">
      <ProfessorValidationToolbar
        v-model:search="search"
        v-model:selected-type="selectedType"
        v-model:selected-status="selectedStatus"
      />

      <div v-if="isLoading" class="state-box">
        Chargement des validations...
      </div>

      <div v-else-if="errorMessage" class="state-box error">
        {{ errorMessage }}
      </div>

      <ProfessorValidationsTable
        v-else
        :validations="filteredValidations"
        @view="openDetails"
        @approve="handleApprove"
        @reject="handleReject"
        @request-changes="handleRequestChanges"
      />
    </section>

    <ProfessorValidationDetailsModal
      v-if="isDetailsOpen && selectedValidation"
      :validation="selectedValidation"
      @close="closeDetails"
      @approve="handleApprove"
      @reject="handleReject"
      @request-changes="handleRequestChanges"
    />
  </section>
</template>

<style scoped>
.professor-validations-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  color: var(--app-text);
}

.page-header span {
  display: block;
  color: var(--app-subtle);
  font-size: var(--app-text-xs);
  font-weight: 800;
  letter-spacing: 0.06em;
  margin-bottom: 0.35rem;
}

.page-header h1 {
  margin: 0;
  color: var(--app-heading);
  font-family: var(--app-font-display);
  font-size: clamp(1.8rem, 2.4vw, 2.3rem);
  font-weight: 500;
}

.page-header p {
  margin: 0.45rem 0 0;
  color: var(--app-muted);
}

.validations-card {
  overflow: hidden;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-panel);
  box-shadow: var(--app-shadow-card);
}

.state-box {
  padding: 2rem;
  color: var(--app-muted);
  text-align: center;
}

.state-box.error {
  color: var(--app-error);
}
</style>
