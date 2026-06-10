<script setup>
defineProps({
  letter: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close"]);

const formatDate = (date) => {
  if (!date) return "";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
};
</script>

<template>
  <div v-if="letter" class="preview-overlay" @click.self="emit('close')">
    <section class="preview-modal" role="dialog" aria-modal="true">
      <header>
        <span class="modal-icon material-icons-round">history_edu</span>
        <div>
          <span>LETTRE DE RECOMMANDATION</span>
          <h2>{{ letter.title }}</h2>
        </div>
        <button type="button" aria-label="Fermer" @click="emit('close')">
          <span class="material-icons-round">close</span>
        </button>
      </header>

      <div class="letter-heading">
        <div>
          <span>Rédigée par</span>
          <strong>{{ letter.author.fullName }}</strong>
          <small>
            {{ letter.author.specialty || "Enseignant" }}
            ·
            {{ letter.author.department || "Département non renseigné" }}
          </small>
        </div>
        <time>{{ formatDate(letter.validatedAt || letter.createdAt) }}</time>
      </div>

      <article class="letter-content">
        <p>{{ letter.letterContent }}</p>
      </article>

      <footer>
        <button type="button" class="secondary" @click="emit('close')">
          Fermer
        </button>
      </footer>
    </section>
  </div>
</template>

<style scoped>
.preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(0.12rem);
}

.preview-modal {
  width: min(100%, 43rem);
  max-height: calc(100vh - 2rem);
  overflow: auto;
  padding: 1.35rem;
  border: 1px solid #dee1dd;
  border-top: 0.28rem solid #2f575d;
  border-radius: 1rem;
  background: #ffffff;
  box-shadow: 0 1.2rem 3rem rgba(16, 42, 51, 0.18);
}

header,
footer,
.letter-heading {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
}

header div {
  min-width: 0;
  flex: 1;
}

.modal-icon {
  width: 2.8rem;
  height: 2.8rem;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #edf2f0;
  color: #2f575d;
}

header div > span {
  color: #6d9197;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
}

h2 {
  margin: 0.2rem 0 0;
  color: #28363d;
  font-family: "Times New Roman", serif;
  font-size: 1.6rem;
}

header button {
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

.letter-heading {
  justify-content: space-between;
  margin-top: 1.25rem;
  padding: 1rem;
  border: 1px solid #dee1dd;
  border-radius: 0.75rem;
  background: #f8f9f8;
}

.letter-heading div {
  display: grid;
  gap: 0.2rem;
}

.letter-heading span,
.letter-heading small,
.letter-heading time {
  color: #6d9197;
  font-size: 0.8rem;
}

.letter-heading strong {
  color: #28363d;
}

.letter-content {
  margin-top: 1rem;
  padding: 1.5rem;
  border: 1px solid #dee1dd;
  border-radius: 0.75rem;
  background: #ffffff;
}

.letter-content p {
  margin: 0;
  color: #435b60;
  font-family: Georgia, serif;
  font-size: 1rem;
  line-height: 1.8;
  white-space: pre-line;
}

footer {
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #edf0ee;
}

footer button {
  min-height: 2.55rem;
  display: inline-flex;
  align-items: center;
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

</style>
