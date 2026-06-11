<script setup>
import { computed, onMounted, ref } from "vue";

import RecommendationLetterCard from "@/components/student/recommendationLetters/RecommendationLetterCard.vue";
import RecommendationLetterFilters from "@/components/student/recommendationLetters/RecommendationLetterFilters.vue";
import RecommendationLetterPreviewModal from "@/components/student/recommendationLetters/RecommendationLetterPreviewModal.vue";
import { getStudentRecommendationLetters } from "@/services/studentRecommendationLettersService";

const letters = ref([]);
const search = ref("");
const selectedStatus = ref("ALL");
const selectedType = ref("ALL");
const isLoading = ref(false);
const selectedLetter = ref(null);

const loadData = async () => {
  isLoading.value = true;
  letters.value = await getStudentRecommendationLetters();
  isLoading.value = false;
};

onMounted(loadData);

const filteredLetters = computed(() => {
  const query = search.value.trim().toLowerCase();

  return letters.value.filter((letter) => {
    const matchesSearch =
      !query ||
      letter.title.toLowerCase().includes(query) ||
      letter.author.fullName.toLowerCase().includes(query);
    const matchesStatus =
      selectedStatus.value === "ALL" ||
      letter.validationStatus === selectedStatus.value;
    const matchesType =
      selectedType.value === "ALL" || letter.type === selectedType.value;

    return matchesSearch && matchesStatus && matchesType;
  });
});
</script>

<template>
  <section class="letters-page">
    <header class="page-header">
      <div>
        <span class="page-label">RECOMMANDATIONS</span>
        <h1>Lettres de recommandation</h1>
        <p>Gérez vos demandes et documents de recommandation académique.</p>
      </div>

    </header>

    <RecommendationLetterFilters
      v-model:search="search"
      v-model:status="selectedStatus"
      v-model:type="selectedType"
    />

    <div v-if="isLoading" class="empty-state">
      <span class="material-icons-round">hourglass_top</span>
      <h3>Chargement...</h3>
      <p>Récupération de vos lettres de recommandation.</p>
    </div>

    <div v-else-if="filteredLetters.length" class="letters-grid">
      <RecommendationLetterCard
        v-for="letter in filteredLetters"
        :key="letter.id"
        :letter="letter"
        @view="selectedLetter = $event"
      />
    </div>

    <div v-else class="empty-state">
      <span class="material-icons-round">history_edu</span>
      <h3>Aucune lettre trouvée</h3>
      <p>Modifiez les filtres ou revenez plus tard.</p>
    </div>

    <div class="count-line">
      <span></span>
      <p>{{ filteredLetters.length }} lettres</p>
      <span></span>
    </div>

    <RecommendationLetterPreviewModal
      :letter="selectedLetter"
      @close="selectedLetter = null"
    />
  </section>
</template>

<style scoped>
.letters-page {
  padding: 0;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.25rem;
  margin-bottom: 1.125rem;
}

.page-label {
  display: inline-block;
  margin-bottom: 0.4rem;
  color: #a8aca8;
  font-size: 0.8rem;
  font-style: italic;
}

h1 {
  margin: 0 0 0.25rem;
  color: #28363d;
  font-size: 2rem;
  line-height: 1.15;
}

.page-header p {
  margin: 0;
  color: #6d9197;
  font-size: 0.875rem;
  font-style: italic;
}

.add-btn {
  min-height: 2.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  border-radius: 0.5625rem;
  padding: 0 1.2rem;
  background: #2f575d;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 0.375rem 0.875rem rgba(47, 87, 93, 0.16);
}

.letters-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  margin-top: 1.5rem;
}

.feedback {
  margin: 1rem 0 0;
  padding: 0.8rem 1rem;
  border: 1px solid #c4cdc1;
  border-radius: 0.75rem;
  background: #ffffff;
  color: #2f575d;
  font-weight: 700;
}

.empty-state {
  margin-top: 1.5rem;
  padding: 3rem 1.5rem;
  border: 1px solid #dee1dd;
  border-radius: 0.875rem;
  background: #ffffff;
  color: #6d9197;
  text-align: center;
}

.empty-state .material-icons-round {
  color: #99aead;
  font-size: 2.4rem;
}

.empty-state h3 {
  margin: 0.6rem 0 0.3rem;
  color: #28363d;
}

.empty-state p {
  margin: 0;
}

.count-line {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1.75rem;
  color: #6d9197;
}

.count-line span {
  height: 1px;
  flex: 1;
  background: #dee1dd;
}

.count-line p {
  white-space: nowrap;
}

@media (max-width: 760px) {
  .page-header {
    flex-direction: column;
  }

  .add-btn {
    width: 100%;
    justify-content: center;
  }

  .letters-grid {
    grid-template-columns: 1fr;
  }
}
</style>
