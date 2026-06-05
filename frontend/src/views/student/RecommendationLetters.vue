<script setup>
const letters = [
  {
    id: "letter-1",
    author: "Pr. Karim Moussaoui",
    role: "Enseignant referent",
    organization: "ENSA Tanger",
    title: "Lettre pour stage PFE",
    status: "Disponible",
    date: "20 mai 2026",
    downloadable: true,
  },
  {
    id: "letter-2",
    author: "Nadia El Amrani",
    role: "Recruteuse",
    organization: "Orange Digital Center",
    title: "Recommandation professionnelle",
    status: "En preparation",
    date: "18 mai 2026",
    downloadable: false,
  },
];
</script>

<template>
  <section class="recommendation-letters-page">
    <header class="page-header">
      <div>
        <span class="page-label">LETTRES</span>
        <h1>Mes lettres de recommandation</h1>
        <p>Retrouvez les lettres partageables avec vos candidatures.</p>
      </div>
    </header>

    <div class="letters-grid">
      <article v-for="letter in letters" :key="letter.id" class="letter-card">
        <span class="letter-status" :class="{ muted: !letter.downloadable }">
          {{ letter.status }}
        </span>

        <h2>{{ letter.title }}</h2>

        <dl class="letter-meta">
          <div>
            <dt>Auteur</dt>
            <dd>{{ letter.author }}</dd>
          </div>

          <div>
            <dt>Role</dt>
            <dd>{{ letter.role }}</dd>
          </div>

          <div>
            <dt>Organisation</dt>
            <dd>{{ letter.organization }}</dd>
          </div>

          <div>
            <dt>Date</dt>
            <dd>{{ letter.date }}</dd>
          </div>
        </dl>

        <button class="primary-btn" type="button" :disabled="!letter.downloadable">
          {{ letter.downloadable ? "Telecharger" : "Indisponible" }}
        </button>
      </article>
    </div>
  </section>
</template>

<style scoped>
.recommendation-letters-page {
  padding: 0;
}

.page-header {
  margin-bottom: 1.125rem;
}

.page-label {
  display: inline-block;
  margin-bottom: 0.4rem;
  color: #a8aca8;
  font-family: serif;
  font-size: 0.78rem;
  font-style: italic;
}

.page-header h1 {
  color: #28363d;
  font-family: serif;
  font-size: 2rem;
  line-height: 1.15;
  margin: 0 0 0.25rem;
}

.page-header p {
  color: #6d9197;
  font-family: serif;
  font-size: 0.875rem;
  font-style: italic;
  margin: 0;
}

.letters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
  gap: 1rem;
}

.letter-card {
  background: #ffffff;
  border: 1px solid #dee1dd;
  border-radius: 0.95rem;
  padding: 1.25rem;
}

.letter-status {
  display: inline-flex;
  border-radius: 999px;
  background: #e8f5ec;
  color: #2e7d32;
  font-size: 0.75rem;
  font-weight: 800;
  margin-bottom: 0.65rem;
  padding: 0.32rem 0.7rem;
}

.letter-status.muted {
  background: #fff4e4;
  color: #b96b13;
}

.letter-card h2 {
  color: #102a33;
  font-size: 1.1rem;
  margin: 0 0 1rem;
}

.letter-meta {
  display: grid;
  gap: 0.75rem;
  margin: 0 0 1.1rem;
}

.letter-meta div {
  display: grid;
  gap: 0.2rem;
}

.letter-meta dt {
  color: #8a9fa3;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
}

.letter-meta dd {
  color: #435b60;
  font-size: 0.92rem;
  margin: 0;
}

.primary-btn {
  background: #2f575d;
  border: 1px solid #2f575d;
  border-radius: 0.65rem;
  color: #ffffff;
  cursor: pointer;
  font-size: 0.84rem;
  font-weight: 800;
  height: 2.45rem;
  padding: 0 0.95rem;
}

.primary-btn:disabled {
  background: #edf2f0;
  border-color: #dee1dd;
  color: #8a9fa3;
  cursor: not-allowed;
}
</style>
