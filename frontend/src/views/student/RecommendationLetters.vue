<script setup>
import { onMounted, ref } from "vue";
import { getStudentPortfolioData } from "@/services/studentPortfolioService";
import { buildBackendUrl } from "@/services/backendUrl";

const letters = ref([]);
const loading = ref(false);
const error = ref("");

const formatDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString("fr-FR");
};

const loadLetters = async () => {
  loading.value = true;
  error.value = "";

  try {
    const data = await getStudentPortfolioData();
    letters.value = data.recommendationLetters || [];
  } catch {
    error.value = "Impossible de charger les lettres de recommandation.";
  } finally {
    loading.value = false;
  }
};

onMounted(loadLetters);
</script>

<template>
  <section class="student-list-page">
    <header>
      <h1>Lettres de recommandation</h1>
      <p>Lettres validees disponibles pour votre portfolio.</p>
    </header>

    <p v-if="loading" class="state">Chargement...</p>
    <p v-else-if="error" class="state error">{{ error }}</p>
    <p v-else-if="!letters.length" class="state">
      Aucune lettre validee pour le moment.
    </p>

    <div v-else class="items">
      <article v-for="letter in letters" :key="letter.id" class="item">
        <div>
          <h2>{{ letter.title }}</h2>
          <p class="meta">
            {{ letter.author?.name || "Auteur non renseigne" }}
            <span v-if="letter.validatedAt">- {{ formatDate(letter.validatedAt) }}</span>
          </p>
          <p class="content">{{ letter.content }}</p>
        </div>

        <a
          v-if="letter.documentUrl"
          :href="buildBackendUrl(letter.documentUrl)"
          target="_blank"
          rel="noreferrer"
          class="item-link"
        >
          Document
        </a>
      </article>
    </div>
  </section>
</template>

<style scoped>
.student-list-page {
  padding: 32px;
}

header {
  margin-bottom: 24px;
}

h1 {
  margin: 0 0 8px;
  color: #122033;
  font-size: 28px;
}

header p,
.meta,
.state {
  color: #64748b;
}

.items {
  display: grid;
  gap: 14px;
}

.item {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
}

.item h2 {
  margin: 0 0 4px;
  color: #1e293b;
  font-size: 18px;
}

.meta,
.content {
  margin: 0;
}

.content {
  margin-top: 10px;
  color: #334155;
}

.item-link {
  align-self: start;
  padding: 8px 12px;
  border-radius: 6px;
  color: #ffffff;
  background: #2563eb;
  text-decoration: none;
  font-weight: 600;
}

.error {
  color: #dc2626;
}

@media (max-width: 640px) {
  .student-list-page {
    padding: 20px;
  }

  .item {
    grid-template-columns: 1fr;
  }
}
</style>
