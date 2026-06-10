<script setup>
import RecommendationLetterStatusBadge from "./RecommendationLetterStatusBadge.vue";

defineProps({
  letter: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["view"]);

const typeLabels = {
  DOUBLE_DEGREE: "Double diplôme",
  MASTER: "Master",
  DOCTORATE: "Doctorat",
  INTERNSHIP: "Stage",
  EMPLOYMENT: "Emploi",
  INTERNATIONAL_PROGRAM: "Programme international",
};

const formatDate = (date) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
</script>

<template>
  <article class="letter-card">
    <section class="letter-main">
      <div class="author-icon material-icons-round">history_edu</div>
      <div class="letter-copy">
        <div class="author">
          <div>
            <span>Auteur</span>
            <strong>{{ letter.author.fullName }}</strong>
          </div>
        </div>

        <div class="letter-body">
          <span class="type-label">{{ typeLabels[letter.type] || letter.type }}</span>
          <h3>{{ letter.title }}</h3>
          <p>{{ letter.requestMessage || letter.content }}</p>
        </div>

        <div class="letter-meta">
          <span>
            <span class="material-icons-round">calendar_month</span>
            Demandée le {{ formatDate(letter.createdAt) }}
          </span>
          <span>
            <span class="material-icons-round">school</span>
            {{ letter.author.department || "Département non renseigné" }}
          </span>
        </div>

      </div>
    </section>

    <aside>
      <RecommendationLetterStatusBadge :status="letter.validationStatus" />
      <div v-if="letter.rejectionReason" class="validator-feedback">
        <span class="material-icons-round">info</span>
        <p>
          <strong>Retour du validateur</strong>
          {{ letter.rejectionReason }}
        </p>
      </div>
      <button
        v-if="letter.letterContent"
        type="button"
        @click="emit('view', letter)"
      >
        <span class="material-icons-round">menu_book</span>
        Voir la lettre
      </button>
    </aside>
  </article>
</template>

<style scoped>
.letter-card {
  min-width: 0;
  padding: 1.25rem;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 11rem;
  gap: 1.25rem;
  border: 1px solid #dee1dd;
  border-radius: 1rem;
  background: #ffffff;
  transition: 0.2s ease;
}

.letter-card:hover {
  transform: translateY(-0.125rem);
  border-color: #c4cdc1;
  box-shadow: 0 0.625rem 1.5rem rgba(47, 87, 93, 0.08);
}

.letter-main,
.author,
.letter-meta span {
  display: flex;
  align-items: center;
}

.letter-main {
  align-items: flex-start;
  gap: 0.8rem;
}

.author {
  min-width: 0;
  gap: 0.65rem;
}

.author-icon {
  width: 2.6rem;
  height: 2.6rem;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #edf2f0;
  color: #2f575d;
}

.author div {
  min-width: 0;
  display: grid;
  gap: 0.15rem;
}

.letter-copy {
  min-width: 0;
  flex: 1;
}

.author span:not(.author-icon),
.type-label {
  color: #99aead;
  font-size: 0.75rem;
  font-weight: 700;
}

.author strong {
  color: #28363d;
  overflow-wrap: anywhere;
}

.letter-body h3 {
  margin: 0.3rem 0 0.45rem;
  color: #28363d;
  font-family: "Times New Roman", serif;
  font-size: 1.2rem;
}

.letter-body p {
  margin: 0;
  color: #526f75;
  font-size: 0.875rem;
  line-height: 1.55;
}

.letter-meta {
  display: grid;
  gap: 0.45rem;
  padding-top: 0.8rem;
  border-top: 1px solid #edf0ee;
}

.letter-meta span {
  gap: 0.4rem;
  color: #6d9197;
  font-size: 0.8rem;
}

.letter-meta .material-icons-round {
  color: #2f575d;
  font-size: 1rem;
}

.validator-feedback {
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding-top: 0.8rem;
  border-top: 1px solid #edf0ee;
  color: #526f75;
}

.validator-feedback .material-icons-round {
  color: #6d9197;
  font-size: 1.1rem;
}

.validator-feedback p {
  margin: 0;
  font-size: 0.84rem;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.validator-feedback strong {
  display: block;
  margin-bottom: 0.2rem;
  color: #2f575d;
}

aside {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  padding-left: 1rem;
  border-left: 1px solid #edf0ee;
}

aside button {
  width: 100%;
  min-height: 2.55rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  border: 1px solid #c4cdc1;
  border-radius: 0.625rem;
  background: #ffffff;
  color: #2f575d;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 700px) {
  .letter-card {
    grid-template-columns: 1fr;
  }

  aside {
    align-items: flex-start;
    padding: 1rem 0 0;
    border-top: 1px solid #edf0ee;
    border-left: 0;
  }
}
</style>
