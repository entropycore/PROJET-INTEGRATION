<script setup>
import { onMounted, ref } from "vue";
import api from "@/services/api";

const comments = ref([]);
const loading = ref(false);
const error = ref("");

const formatDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString("fr-FR");
};

const loadComments = async () => {
  loading.value = true;
  error.value = "";

  try {
    const response = await api.get("/student/comments");
    comments.value = response.data?.data || [];
  } catch {
    error.value = "Impossible de charger les commentaires.";
  } finally {
    loading.value = false;
  }
};

onMounted(loadComments);
</script>

<template>
  <section class="student-list-page">
    <header>
      <h1>Commentaires</h1>
      <p>Commentaires recus sur votre portfolio.</p>
    </header>

    <p v-if="loading" class="state">Chargement...</p>
    <p v-else-if="error" class="state error">{{ error }}</p>
    <p v-else-if="!comments.length" class="state">
      Aucun commentaire pour le moment.
    </p>

    <div v-else class="items">
      <article v-for="comment in comments" :key="comment.id" class="item">
        <div class="item-head">
          <h2>{{ comment.author?.fullName || "Auteur non renseigne" }}</h2>
          <span>{{ comment.status }}</span>
        </div>
        <p class="content">{{ comment.content }}</p>
        <p class="meta">{{ formatDate(comment.createdAt) }}</p>
        <p v-if="comment.rejectionReason" class="rejection">
          {{ comment.rejectionReason }}
        </p>
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
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
}

.item-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.item-head h2 {
  margin: 0;
  color: #1e293b;
  font-size: 18px;
}

.item-head span {
  color: #2563eb;
  font-weight: 700;
}

.content {
  margin: 10px 0;
  color: #334155;
}

.rejection {
  margin: 10px 0 0;
  color: #b91c1c;
}

.error {
  color: #dc2626;
}

@media (max-width: 640px) {
  .student-list-page {
    padding: 20px;
  }

  .item-head {
    display: grid;
  }
}
</style>
